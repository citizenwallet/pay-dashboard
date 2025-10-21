import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
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
 * Fetches business mapping from the destination database using original_business_id
 */
const fetchBusinessMapping = async (
  remoteClient: SupabaseClient
): Promise<{ [key: number]: string }> => {
  const { data: businesses, error } = await remoteClient
    .from('businesses')
    .select('id, original_business_id')
    .not('original_business_id', 'is', null);

  if (error) {
    console.error('Error fetching business mapping from destination:', error);
    throw error;
  }

  const mapping: { [key: number]: string } = {};
  businesses?.forEach((business) => {
    if (business.original_business_id) {
      mapping[business.original_business_id] = business.id;
    }
  });

  return mapping;
};

/**
 * Validates if a place has all required fields for migration
 */
const isValidPlace = (place: {
  name?: string | null;
  slug?: string | null;
  business_id?: number | null;
}): boolean => {
  return !!place.name && !!place.slug && !!place.business_id;
};

/**
 * Map display type from source to destination
 */
const mapDisplayType = (sourceDisplay: string | null): string => {
  switch (sourceDisplay) {
    case 'amount':
      return 'amount';
    case 'menu':
      return 'menu';
    case 'amountAndMenu':
      return 'amountAndMenu';
    case 'topup':
      return 'topup';
    default:
      return 'amountAndMenu'; // Default value from destination schema
  }
};

/**
 * Convert tokens from jsonb array to text array
 */
const convertTokens = (tokens: unknown): string[] => {
  if (!tokens || !Array.isArray(tokens)) {
    return ['0x5815E61eF72c9E6107b5c5A05FD121F334f7a7f1']; // Default token
  }
  return tokens.map((token) => String(token));
};

/**
 * Get first account address from accounts jsonb array
 */
const getAccountAddress = (accounts: unknown): string => {
  if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
    return '0x0000000000000000000000000000000000000000'; // Default address
  }
  return String(accounts[0]);
};

/**
 * This script migrates places from the source schema to the destination schema.
 * It fetches business mappings from the destination database using original_business_id.
 *
 * IDEMPOTENCY FEATURES:
 * - Places are checked by slug before insertion to prevent duplicates
 * - Existing records are skipped and their IDs are logged
 * - Business mappings are fetched from destination database using original_business_id column
 *
 * PLACES MIGRATION - Source schema fields mapped:
 * - business_id -> business_id (using business mapping from destination DB)
 * - name -> name
 * - slug -> slug
 * - description -> description
 * - image -> image
 * - accounts[0] -> account_address (first account from jsonb array)
 * - hidden -> hidden
 * - archived -> archived
 * - tokens -> tokens (converted from jsonb array to text array)
 * - display -> display (mapped to valid enum values)
 * - created_at -> created_at
 *
 * Fields not migrated (source has more info):
 * - invite_code, terminal_id
 */
const main = async () => {
  const remoteUrl = process.argv[2];
  const remoteKey = process.argv[3];
  if (!remoteUrl || !remoteKey) {
    console.error('Usage: node scripts/migrate_places.ts <url> <key>');
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

  // Fetch business mapping from destination database
  console.log('Fetching business mapping from destination database...');
  const businessMapping = await fetchBusinessMapping(remoteClient);
  console.log(`Found ${Object.keys(businessMapping).length} business mappings`);

  // migrate places from public.places to public.places
  console.log('Starting places migration...');

  // Fetch places from source public.places table
  const { data: sourcePlaces, error: placesFetchError } = await client
    .from('places')
    .select('*');

  if (placesFetchError) {
    console.error('Error fetching places from source:', placesFetchError);
    return;
  }

  console.log(`Found ${sourcePlaces?.length || 0} places to migrate`);

  if (!sourcePlaces || sourcePlaces.length === 0) {
    console.log('No places to migrate');
    return;
  }

  // Log places that will be skipped
  const skippedPlaces = sourcePlaces.filter((place) => {
    const hasValidFields = isValidPlace(place);
    const hasBusiness = businessMapping[place.business_id];

    if (!hasValidFields) {
      console.log(
        `Skipping place ${
          place.name || 'unnamed'
        } - missing required fields (name, slug, or business_id)`
      );
    }
    if (!hasBusiness) {
      console.log(
        `Skipping place ${
          place.name || 'unnamed'
        } - business not found or not migrated`
      );
    }

    return !hasValidFields || !hasBusiness;
  });

  console.log(
    `Skipping ${skippedPlaces.length} places due to missing data or business references`
  );

  // Prepare places for destination table
  const migratedPlaces = sourcePlaces
    .filter((place) => {
      // Only migrate places that have required fields and a valid business reference
      return (
        isValidPlace(place) && businessMapping[place.business_id] // Must have a migrated business
      );
    })
    .map((place) => {
      const businessId = businessMapping[place.business_id];

      return {
        business_id: businessId,
        name: place.name,
        slug: place.slug,
        description: place.description,
        image: place.image,
        account_address: getAccountAddress(place.accounts),
        hidden: place.hidden || false,
        archived: place.archived || false,
        tokens: convertTokens(place.tokens),
        display: mapDisplayType(place.display),
        created_at: place.created_at,
        updated_at: new Date().toISOString(),
        original_place_id: place.id // Store original ID for reference
      };
    });

  console.log(`Prepared ${migratedPlaces.length} places for migration`);

  // Insert places into destination table using the remote client
  console.log('Inserting places into destination...');

  const placeMapping: { [key: number]: string } = {}; // original_id -> new_uuid
  let newPlacesCount = 0;
  let existingPlacesCount = 0;
  let placesErrorCount = 0;

  for (const place of migratedPlaces) {
    const originalPlaceId = place.original_place_id;

    try {
      // Check if place already exists by slug
      const { data: existingPlace, error: checkError } = await remoteClient
        .from('places')
        .select('id')
        .eq('slug', place.slug)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingPlace) {
        console.log(
          `Place already exists, skipping: ${place.name} (slug: ${place.slug}, ID: ${existingPlace.id})`
        );
        placeMapping[originalPlaceId] = existingPlace.id;
        existingPlacesCount++;
      } else {
        const { data: insertedPlace, error: insertError } = await remoteClient
          .from('places')
          .insert(place)
          .select('id')
          .single();

        if (insertError) {
          console.error(`Error inserting place ${place.name}:`, insertError);
          placesErrorCount++;
        } else {
          console.log(
            `Successfully migrated place: ${place.name} (slug: ${place.slug}, ID: ${insertedPlace.id})`
          );
          placeMapping[originalPlaceId] = insertedPlace.id;
          newPlacesCount++;
        }
      }
    } catch (err) {
      console.error(`Unexpected error migrating place ${place.name}:`, err);
      placesErrorCount++;
    }
  }

  console.log('Places migration completed');
  console.log('Place ID mapping:', placeMapping);

  // Save place mapping to file for potential future use
  const placeMappingPath = path.join(__dirname, 'place_mapping.json');
  fs.writeFileSync(placeMappingPath, JSON.stringify(placeMapping, null, 2));
  console.log(`Place mapping saved to: ${placeMappingPath}`);

  // Final summary
  console.log('\n=== PLACES MIGRATION SUMMARY ===');
  console.log(`Total places found: ${sourcePlaces?.length || 0}`);
  console.log(
    `Places with required fields and business references: ${migratedPlaces.length}`
  );
  console.log(`New places migrated: ${newPlacesCount}`);
  console.log(`Existing places found: ${existingPlacesCount}`);
  console.log(`Failed migrations: ${placesErrorCount}`);
  console.log(
    `Places without business references: ${
      sourcePlaces?.length - migratedPlaces.length - placesErrorCount
    }`
  );
  console.log('==================================\n');
};

main();
