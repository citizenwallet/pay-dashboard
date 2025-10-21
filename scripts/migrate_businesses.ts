import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const getServiceRoleClient = (url: string, key: string): SupabaseClient => {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Validates if a business has all required fields for migration
 */
const isValidBusiness = (business: {
  name?: string | null;
  vat_number?: string | null;
}): boolean => {
  return !!business.name && !!business.vat_number;
};

/**
 * Normalizes VAT number by removing spaces, hyphens, and converting to uppercase
 */
const normalizeVatNumber = (vatNumber: string | null): string | null => {
  if (!vatNumber) return null;
  return vatNumber.replace(/[\s-]/g, '').toUpperCase();
};

/**
 * Checks if a user already exists in the destination by email using Auth Admin API
 */
const checkExistingUser = async (
  client: SupabaseClient,
  email: string
): Promise<{ id: string; exists: boolean }> => {
  const { data, error } = await client.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    throw error;
  }

  const user = data?.users?.find((u) => u.email === email);

  return {
    id: user?.id || '',
    exists: !!user
  };
};

/**
 * Checks if a business already exists in the destination by normalized VAT number
 */
const checkExistingBusiness = async (
  client: SupabaseClient,
  normalizedVatNumber: string
): Promise<{ id: string; exists: boolean }> => {
  const { data, error } = await client
    .from('businesses')
    .select('id')
    .eq('vat_number', normalizedVatNumber)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    throw error;
  }

  return {
    id: data?.id || '',
    exists: !!data
  };
};

/**
 * This script migrates users and businesses from the source schema to the destination schema.
 * It handles the transformation of data and maintains proper relationships between entities.
 * The original business ID is stored in the original_business_id column for reference by other migrations.
 *
 * IDEMPOTENCY FEATURES:
 * - Users are checked by email before insertion to prevent duplicates
 * - Businesses are checked by normalized VAT number before insertion to prevent duplicates
 * - VAT numbers are normalized (spaces/hyphens removed, uppercase) for consistent comparison
 * - Existing records are skipped and their IDs are used in the mapping for entity linking
 *
 * BUSINESS MIGRATION - Source schema fields mapped:
 * - name -> commercial_name
 * - legal_name -> legal_name
 * - address_legal -> legal_address
 * - vat_number -> vat_number (normalized)
 * - iban_number -> iban_number
 * - accepted_terms_and_conditions -> accepted_terms (boolean)
 * - business_status -> status (mapped)
 * - created_at -> created_at
 * - id -> original_business_id (for reference by other migrations)
 *
 * Fields not migrated (source has more info):
 * - account, invite_code, email, phone, website, image, accepted_membership_agreement
 */
const main = async () => {
  const remoteUrl = process.argv[2];
  const remoteKey = process.argv[3];
  if (!remoteUrl || !remoteKey) {
    console.error('Usage: node scripts/migrate_businesses.ts <url> <key>');
    return;
  }

  const remoteClient = getServiceRoleClient(remoteUrl, remoteKey);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file'
    );
    return;
  }

  const client = getServiceRoleClient(url, key);

  // migrate users from public.users to auth.users
  console.log('Starting user migration...');

  // Fetch users from public.users table
  const { data: publicUsers, error: fetchError } = await client
    .from('users')
    .select('id, name, email, linked_business_id, created_at')
    .not('email', 'is', null) // Only migrate users with email
    .not('email', 'eq', '') // Exclude empty emails
    .not('linked_business_id', 'is', null);

  if (fetchError) {
    console.error('Error fetching users from public.users:', fetchError);
    return;
  }

  console.log(`Found ${publicUsers?.length || 0} users to migrate`);

  if (!publicUsers || publicUsers.length === 0) {
    console.log('No users to migrate');
    return;
  }

  // Remove duplicate emails (keep first occurrence)
  const uniqueUsers = publicUsers.filter(
    (user, index, self) =>
      index === self.findIndex((u) => u.email === user.email)
  );

  if (uniqueUsers.length !== publicUsers.length) {
    console.log(
      `Removed ${publicUsers.length - uniqueUsers.length} duplicate users`
    );
  }

  // Prepare users for auth.users table
  const authUsers = uniqueUsers.map((user) => ({
    email: user.email,
    user_metadata: {
      name: user.name,
      original_user_id: user.id, // Store original ID for reference
      linked_business_id: user.linked_business_id
    },
    email_confirm: true, // Mark as confirmed
    created_at: user.created_at
  }));

  // Insert users into auth.users table using the remote client
  console.log('Inserting users into auth.users...');

  const userMapping: { [key: number]: string } = {}; // original_id -> new_auth_id
  let newUsersCount = 0;
  let existingUsersCount = 0;

  for (const user of authUsers) {
    try {
      // Check if user already exists
      const existingUser = await checkExistingUser(remoteClient, user.email);

      if (existingUser.exists) {
        console.log(
          `User already exists, skipping: ${user.email} (ID: ${existingUser.id})`
        );
        // Store mapping for business linking later
        const originalId = user.user_metadata.original_user_id;
        userMapping[originalId] = existingUser.id;
        existingUsersCount++;
      } else {
        const { data: createdUser, error: insertError } =
          await remoteClient.auth.admin.createUser(user);

        if (insertError) {
          console.error(`Error inserting user ${user.email}:`, insertError);
        } else {
          console.log(
            `Successfully migrated user: ${user.email} (ID: ${createdUser.user.id})`
          );
          // Store mapping for business linking later
          const originalId = user.user_metadata.original_user_id;
          userMapping[originalId] = createdUser.user.id;
          newUsersCount++;
        }
      }
    } catch (err) {
      console.error(`Unexpected error migrating user ${user.email}:`, err);
    }
  }

  console.log('User migration completed');
  console.log('User ID mapping:', userMapping);

  // Final summary
  console.log('\n=== USER MIGRATION SUMMARY ===');
  console.log(`Total users found: ${publicUsers?.length || 0}`);
  console.log(`Unique users (after deduplication): ${uniqueUsers.length}`);
  console.log(`New users migrated: ${newUsersCount}`);
  console.log(`Existing users found: ${existingUsersCount}`);
  console.log(`Total users in mapping: ${Object.keys(userMapping).length}`);
  console.log('===============================\n');

  // migrate businesses from public.businesses to public.businesses
  console.log('Starting business migration...');

  // Fetch businesses from source public.businesses table
  const { data: sourceBusinesses, error: businessFetchError } = await client
    .from('businesses')
    .select('*');

  if (businessFetchError) {
    console.error('Error fetching businesses from source:', businessFetchError);
    return;
  }

  console.log(`Found ${sourceBusinesses?.length || 0} businesses to migrate`);

  if (!sourceBusinesses || sourceBusinesses.length === 0) {
    console.log('No businesses to migrate');
    return;
  }

  // Map business status from source to destination
  const mapBusinessStatus = (sourceStatus: string | null): string => {
    switch (sourceStatus) {
      case 'verified':
        return 'verified';
      case 'rejected':
        return 'rejected';
      case 'created':
      case 'pending':
      default:
        return 'pending';
    }
  };

  // Create reverse mapping: business_id -> user_id
  const businessToUserMapping: { [key: number]: string } = {};

  // Find users that are linked to businesses
  for (const [originalUserId, newUserId] of Object.entries(userMapping)) {
    const user = uniqueUsers.find((u) => u.id === parseInt(originalUserId));
    if (user && user.linked_business_id) {
      businessToUserMapping[user.linked_business_id] = newUserId;
    }
  }

  console.log('Business to User mapping:', businessToUserMapping);

  // Log businesses that will be skipped
  const skippedBusinesses = sourceBusinesses.filter((business) => {
    const hasValidFields = isValidBusiness(business);
    const hasOwner = businessToUserMapping[business.id];

    if (!hasValidFields) {
      console.log(
        `Skipping business ${
          business.name || 'unnamed'
        } - missing required fields`
      );
    }
    if (!hasOwner) {
      console.log(
        `Skipping business ${business.name || 'unnamed'} - no owner found`
      );
    }

    return !hasValidFields || !hasOwner;
  });

  console.log(
    `Skipping ${skippedBusinesses.length} businesses due to missing data or owners`
  );

  // Prepare businesses for destination table
  const migratedBusinesses = sourceBusinesses
    .filter((business) => {
      // Only migrate businesses that have required fields and an owner
      return (
        isValidBusiness(business) && businessToUserMapping[business.id] // Must have an owner
      );
    })
    .map((business) => {
      const ownerId = businessToUserMapping[business.id];
      const normalizedVatNumber = normalizeVatNumber(business.vat_number);

      return {
        owner_id: ownerId,
        commercial_name: business.name,
        legal_name: business.legal_name ?? 'Unknown',
        legal_address: business.address_legal ?? 'Unknown',
        vat_number: normalizedVatNumber, // Use normalized VAT number
        iban_number: business.iban_number ?? 'BE00 0000 0000 0000',
        accepted_terms: !!business.accepted_terms_and_conditions,
        status: mapBusinessStatus(business.business_status),
        created_at: business.created_at,
        updated_at: new Date().toISOString(),
        tokens: ['0x5815E61eF72c9E6107b5c5A05FD121F334f7a7f1'], // Initialize empty tokens array
        original_business_id: business.id // Store original ID for mapping
      };
    });

  console.log(`Prepared ${migratedBusinesses.length} businesses for migration`);

  // Insert businesses into destination table using the remote client
  console.log('Inserting businesses into destination...');

  const businessMapping: { [key: number]: string } = {}; // original_id -> new_uuid
  let newBusinessesCount = 0;
  let existingBusinessesCount = 0;
  let errorCount = 0;

  for (const business of migratedBusinesses) {
    const originalBusinessId = business.original_business_id;

    try {
      // Check if business already exists by normalized VAT number
      const existingBusiness = await checkExistingBusiness(
        remoteClient,
        business.vat_number!
      );

      if (existingBusiness.exists) {
        console.log(
          `Business already exists, skipping: ${business.commercial_name} (VAT: ${business.vat_number}, ID: ${existingBusiness.id})`
        );
        businessMapping[originalBusinessId] = existingBusiness.id;
        existingBusinessesCount++;
      } else {
        const { data: insertedBusiness, error: insertError } =
          await remoteClient
            .from('businesses')
            .insert(business)
            .select('id')
            .single();

        if (insertError) {
          console.error(
            `Error inserting business ${business.commercial_name}:`,
            insertError
          );
          errorCount++;
        } else {
          console.log(
            `Successfully migrated business: ${business.commercial_name} (VAT: ${business.vat_number}, ID: ${insertedBusiness.id})`
          );
          businessMapping[originalBusinessId] = insertedBusiness.id;
          newBusinessesCount++;
        }
      }
    } catch (err) {
      console.error(
        `Unexpected error migrating business ${business.commercial_name}:`,
        err
      );
      errorCount++;
    }
  }

  console.log('Business migration completed');
  console.log('Business ID mapping:', businessMapping);

  // Final summary
  console.log('\n=== BUSINESS MIGRATION SUMMARY ===');
  console.log(`Total businesses found: ${sourceBusinesses?.length || 0}`);
  console.log(
    `Businesses with required fields and owners: ${migratedBusinesses.length}`
  );
  console.log(`New businesses migrated: ${newBusinessesCount}`);
  console.log(`Existing businesses found: ${existingBusinessesCount}`);
  console.log(`Failed migrations: ${errorCount}`);
  console.log(
    `Businesses without owners: ${
      sourceBusinesses?.length - migratedBusinesses.length - errorCount
    }`
  );
  console.log('===================================\n');
};

main();
