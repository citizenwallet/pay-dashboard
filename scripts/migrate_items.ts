import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
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
 * Fetches place ID from destination database using original_place_id
 */
const fetchPlaceId = async (
  remoteClient: SupabaseClient,
  originalPlaceId: number
): Promise<string | null> => {
  const { data: place, error } = await remoteClient
    .from('places')
    .select('id')
    .eq('original_place_id', originalPlaceId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error(
      `Error fetching place for original_place_id ${originalPlaceId}:`,
      error
    );
    return null;
  }

  return place?.id || null;
};

/**
 * Validates if an item has all required fields for migration
 */
const isValidItem = (item: {
  place_id?: number | null;
  name?: string | null;
  price?: number | null;
}): boolean => {
  return !!(item.place_id && item.name && item.price !== null);
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
 * This script migrates POS items from the source schema to the destination schema.
 * It queries the destination database directly for place IDs using original_place_id.
 *
 * IDEMPOTENCY FEATURES:
 * - Items are checked by a combination of fields before insertion to prevent duplicates
 * - Existing records are skipped and their IDs are logged
 * - Place IDs are fetched directly from destination database using original_place_id column
 *
 * ITEMS MIGRATION - Source schema fields mapped:
 * - place_id -> place_id (queried from destination DB using original_place_id)
 * - name -> name (text, required)
 * - description -> description
 * - price -> price (bigint to integer)
 * - image -> image
 * - category -> category
 * - vat -> vat (integer)
 * - order -> display_order (double precision to integer)
 * - hidden -> hidden (boolean, default false in destination vs true in source)
 * - tokens -> tokens (jsonb array to text array)
 * - created_at -> created_at
 * - updated_at -> updated_at (set to current timestamp)
 * - id -> old_id (stores the original item ID from source database)
 *
 * Fields not migrated (source has more info):
 * - emoji (not present in destination schema)
 */
const main = async () => {
  const remoteUrl = process.argv[2];
  const remoteKey = process.argv[3];
  if (!remoteUrl || !remoteKey) {
    console.error('Usage: node scripts/migrate_items.ts <url> <key>');
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

  // No need to fetch place mapping - we'll query directly for each item

  // migrate items from public.pos_items to public.items
  console.log('Starting items migration...');

  // Fetch items from source public.pos_items table
  const { data: sourceItems, error: itemsFetchError } = await client
    .from('pos_items')
    .select('*');

  if (itemsFetchError) {
    console.error('Error fetching items from source:', itemsFetchError);
    return;
  }

  console.log(`Found ${sourceItems?.length || 0} items to migrate`);

  if (!sourceItems || sourceItems.length === 0) {
    console.log('No items to migrate');
    return;
  }

  // Log items that will be skipped
  const skippedItems = sourceItems.filter((item) => {
    const hasValidFields = isValidItem(item);

    if (!hasValidFields) {
      console.log(
        `Skipping item ${
          item.id || 'unknown'
        } - missing required fields (place_id, name, or price)`
      );
    }

    return !hasValidFields;
  });

  console.log(
    `Skipping ${skippedItems.length} items due to missing required fields`
  );

  // Filter items with valid fields
  const validItems = sourceItems.filter((item) => isValidItem(item));
  console.log(`Found ${validItems.length} items with valid fields`);

  // Insert items into destination table using the remote client
  console.log('Inserting items into destination...');

  const itemMapping: { [key: number]: string } = {}; // original_id -> new_uuid
  let newItemsCount = 0;
  let existingItemsCount = 0;
  let itemsErrorCount = 0;
  let skippedPlaceCount = 0;

  for (const item of validItems) {
    const originalItemId = item.id;

    try {
      // Fetch place ID from destination database
      const placeId = await fetchPlaceId(remoteClient, item.place_id);

      if (!placeId) {
        console.log(
          `Skipping item ${originalItemId} - place not found in destination (original_place_id: ${item.place_id})`
        );
        skippedPlaceCount++;
        continue;
      }

      // Prepare item data
      const itemData = {
        place_id: placeId,
        name: item.name,
        description: item.description,
        price: Number(item.price), // Convert bigint to integer
        image: item.image,
        category: item.category,
        vat: item.vat,
        display_order: Math.round(item.order || 0), // Convert double precision to integer
        hidden: item.hidden || false, // Default to false in destination
        tokens: convertTokens(item.tokens),
        created_at: item.created_at,
        updated_at: new Date().toISOString(),
        old_id: originalItemId // Store the old ID for reference
      };

      // Check if item already exists by a combination of unique fields
      // Using place_id, name, and price as a unique identifier
      const { data: existingItem, error: checkError } = await remoteClient
        .from('items')
        .select('id')
        .eq('place_id', placeId)
        .eq('name', item.name)
        .eq('price', item.price)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingItem) {
        // Update old_id if it's not set
        const { error: updateError } = await remoteClient
          .from('items')
          .update({ old_id: originalItemId })
          .eq('id', existingItem.id)
          .is('old_id', null);

        if (updateError && updateError.code !== 'PGRST116') {
          console.error(
            `Error updating old_id for existing item ${existingItem.id}:`,
            updateError
          );
        }

        console.log(
          `Item already exists, skipping: Item ID ${originalItemId} (Place: ${placeId}, Name: ${item.name}, Price: ${item.price})`
        );
        itemMapping[originalItemId] = existingItem.id;
        existingItemsCount++;
      } else {
        const { data: insertedItem, error: insertError } = await remoteClient
          .from('items')
          .insert(itemData)
          .select('id')
          .single();

        if (insertError) {
          console.error(`Error inserting item ${originalItemId}:`, insertError);
          itemsErrorCount++;
        } else {
          console.log(
            `Successfully migrated item: ${originalItemId} -> ${insertedItem.id} (Place: ${placeId}, Name: ${item.name}, Price: ${item.price})`
          );
          itemMapping[originalItemId] = insertedItem.id;
          newItemsCount++;
        }
      }
    } catch (err) {
      console.error(`Unexpected error migrating item ${originalItemId}:`, err);
      itemsErrorCount++;
    }
  }

  console.log('Items migration completed');
  console.log('Item ID mapping:', itemMapping);

  // Final summary
  console.log('\n=== ITEMS MIGRATION SUMMARY ===');
  console.log(`Total items found: ${sourceItems?.length || 0}`);
  console.log(`Items with valid fields: ${validItems.length}`);
  console.log(`New items migrated: ${newItemsCount}`);
  console.log(`Existing items found: ${existingItemsCount}`);
  console.log(`Failed migrations: ${itemsErrorCount}`);
  console.log(`Items skipped due to missing places: ${skippedPlaceCount}`);
  console.log(`Items skipped due to missing fields: ${skippedItems.length}`);
  console.log('================================\n');
};

main();
