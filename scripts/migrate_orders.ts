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
 * Fetches place ID mapping from destination database using original_place_id
 * Returns a map of original_place_id -> new_id (UUID)
 */
const fetchPlaceIdMapping = async (
  remoteClient: SupabaseClient,
  originalPlaceIds: number[]
): Promise<Map<number, string>> => {
  if (originalPlaceIds.length === 0) {
    return new Map();
  }

  const { data: places, error } = await remoteClient
    .from('places')
    .select('id, original_place_id')
    .in('original_place_id', originalPlaceIds);

  if (error) {
    console.error('Error fetching place ID mapping:', error);
    return new Map();
  }

  const mapping = new Map<number, string>();
  if (places) {
    for (const place of places) {
      if (place.original_place_id !== null) {
        mapping.set(place.original_place_id, place.id);
      }
    }
  }

  return mapping;
};

/**
 * Fetches item ID mapping from destination database using old_id
 * Returns a map of old_id -> new_id (UUID)
 */
const fetchItemIdMapping = async (
  remoteClient: SupabaseClient,
  oldItemIds: number[]
): Promise<Map<number, string>> => {
  if (oldItemIds.length === 0) {
    return new Map();
  }

  const { data: items, error } = await remoteClient
    .from('items')
    .select('id, old_id')
    .in('old_id', oldItemIds);

  if (error) {
    console.error('Error fetching item ID mapping:', error);
    return new Map();
  }

  const mapping = new Map<number, string>();
  if (items) {
    for (const item of items) {
      if (item.old_id !== null) {
        mapping.set(item.old_id, item.id);
      }
    }
  }

  return mapping;
};

/**
 * Validates if an order has all required fields for migration
 */
const isValidOrder = (order: {
  place_id?: number | null;
  total?: number | null;
  due?: number | null;
  type?: string | null;
  account?: string | null;
  token?: string | null;
}): boolean => {
  return !!(
    order.place_id &&
    order.total !== null &&
    order.due !== null &&
    order.type &&
    order.token
  );
};

/**
 * Map order status from source to destination
 */
const mapOrderStatus = (sourceStatus: string | null): string => {
  switch (sourceStatus) {
    case 'paid':
      return 'paid';
    case 'cancelled':
      return 'cancelled';
    case 'pending':
      return 'pending';
    case 'refund':
      return 'refund';
    case 'refunded':
      return 'refunded';
    case 'correction':
      return 'correction';
    default:
      return 'pending'; // Default value from destination schema
  }
};

/**
 * Map order type from source to destination
 */
const mapOrderType = (sourceType: string | null): string => {
  switch (sourceType) {
    case 'web':
      return 'web';
    case 'app':
      return 'app';
    case 'terminal':
      return 'terminal';
    case 'system':
      return 'system';
    default:
      return 'web'; // Default value
  }
};

/**
 * Convert items from source format to destination format
 * Remaps item IDs from old_id to new UUID id
 */
const convertItems = (
  items: unknown,
  itemIdMapping: Map<number, string>
): unknown[] => {
  if (!items || !Array.isArray(items)) {
    return []; // Default empty array from destination schema
  }

  return items
    .map((item: unknown) => {
      // Handle items that are objects with id and quantity
      if (item && typeof item === 'object' && 'id' in item && item !== null) {
        const itemObj = item as { id: unknown; [key: string]: unknown };
        const oldItemId = Number(itemObj.id);
        const newItemId = itemIdMapping.get(oldItemId);

        if (!newItemId) {
          console.warn(
            `Warning: Could not find new item ID for old item ID ${oldItemId}. Item will be skipped.`
          );
          return null; // Will be filtered out
        }

        return {
          ...itemObj,
          id: newItemId
        };
      }

      // If item is just a number (item ID), convert it
      if (typeof item === 'number') {
        const newItemId = itemIdMapping.get(item);
        if (!newItemId) {
          console.warn(
            `Warning: Could not find new item ID for old item ID ${item}. Item will be skipped.`
          );
          return null; // Will be filtered out
        }
        return newItemId;
      }

      // Unknown format, return as-is but log warning
      console.warn('Warning: Unknown item format:', item);
      return item;
    })
    .filter((item) => item !== null); // Remove null items (unmapped IDs)
};

/**
 * This script migrates orders from the source schema to the destination schema.
 * It queries the destination database directly for place IDs using original_place_id.
 *
 * IDEMPOTENCY FEATURES:
 * - Orders are checked for existence BEFORE insertion to prevent duplicates
 * - Duplicate detection uses place_id, account, created_at, total, fees, and tx_hash (if available)
 * - Existing records are skipped and their IDs are logged
 * - Place IDs and item IDs are pre-fetched in batches for better performance
 * - Safe to run multiple times - will not create duplicate records
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Place IDs are fetched in a single batch query instead of per-order
 * - Item IDs are pre-mapped in a single batch query
 * - Orders are processed with controlled concurrency (20 at a time) for better throughput
 * - All data preparation happens upfront before any database writes
 *
 * ORDERS MIGRATION - Source schema fields mapped:
 * - place_id -> place_id (queried from destination DB using original_place_id)
 * - created_at -> created_at
 * - total -> total (bigint to integer)
 * - fees -> fees (bigint to integer, default 0)
 * - due -> due (bigint to integer)
 * - items -> items (jsonb array, default empty array, item IDs remapped from old_id to new UUID)
 * - status -> status (mapped to valid enum values)
 * - description -> description
 * - tx_hash -> tx_hash
 * - type -> type (mapped to valid enum values)
 * - account -> account
 * - pos -> terminal (renamed field)
 * - token -> token
 *
 * Fields not migrated (source has more info):
 * - completed_at, payout_id, processor_tx, refund_id
 */
const main = async () => {
  const remoteUrl = process.argv[2];
  const remoteKey = process.argv[3];
  if (!remoteUrl || !remoteKey) {
    console.error('Usage: node scripts/migrate_orders.ts <url> <key>');
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

  // No need to fetch place mapping - we'll query directly for each order

  // migrate orders from public.orders to public.orders
  console.log('Starting orders migration...');

  // Fetch orders from source public.orders table
  const { data: sourceOrders, error: ordersFetchError } = await client
    .from('orders')
    .select('*');

  if (ordersFetchError) {
    console.error('Error fetching orders from source:', ordersFetchError);
    return;
  }

  console.log(`Found ${sourceOrders?.length || 0} orders to migrate`);

  if (!sourceOrders || sourceOrders.length === 0) {
    console.log('No orders to migrate');
    return;
  }

  // Log orders that will be skipped
  const skippedOrders = sourceOrders.filter((order) => {
    const hasValidFields = isValidOrder(order);

    if (!hasValidFields) {
      console.log(
        `Skipping order ${
          order.id || 'unknown'
        } - missing required fields (place_id, total, due, type, account, or token)`
      );
    }

    return !hasValidFields;
  });

  console.log(
    `Skipping ${skippedOrders.length} orders due to missing required fields`
  );

  // Filter orders with valid fields
  const validOrders = sourceOrders.filter((order) => isValidOrder(order));
  console.log(`Found ${validOrders.length} orders with valid fields`);

  // Insert orders into destination table using the remote client
  console.log('Preparing data mappings...');

  // Collect all unique place IDs and item IDs upfront
  const allPlaceIds = new Set<number>();
  const allOldItemIds = new Set<number>();
  for (const order of validOrders) {
    if (order.place_id) {
      allPlaceIds.add(order.place_id);
    }
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item && typeof item === 'object' && 'id' in item) {
          allOldItemIds.add(Number(item.id));
        } else if (typeof item === 'number') {
          allOldItemIds.add(item);
        }
      }
    }
  }

  console.log(
    `Found ${allPlaceIds.size} unique place IDs and ${allOldItemIds.size} unique old item IDs to remap`
  );

  // Fetch all mappings in parallel
  const [placeIdMapping, itemIdMapping] = await Promise.all([
    fetchPlaceIdMapping(remoteClient, Array.from(allPlaceIds)),
    fetchItemIdMapping(remoteClient, Array.from(allOldItemIds))
  ]);

  console.log(
    `Mapped ${placeIdMapping.size} places (${
      allPlaceIds.size - placeIdMapping.size
    } places not found) and ${itemIdMapping.size} items (${
      allOldItemIds.size - itemIdMapping.size
    } items not found in destination)`
  );

  console.log('Inserting orders into destination...');

  const orderMapping: { [key: number]: number } = {}; // original_id -> new_id
  let newOrdersCount = 0;
  let existingOrdersCount = 0;
  let ordersErrorCount = 0;
  let skippedPlaceCount = 0;

  // Prepare all order data upfront
  const ordersToInsert: Array<{
    originalOrderId: number;
    orderData: unknown;
    placeId: string;
  }> = [];

  for (const order of validOrders) {
    const originalOrderId = order.id;

    // Get place ID from mapping
    const placeId = placeIdMapping.get(order.place_id!);

    if (!placeId) {
      console.log(
        `Skipping order ${originalOrderId} - place not found in destination (original_place_id: ${order.place_id})`
      );
      skippedPlaceCount++;
      continue;
    }

    // Prepare order data with remapped item IDs
    const orderData = {
      place_id: placeId,
      created_at: order.created_at,
      total: Number(order.total), // Convert bigint to integer
      fees: Number(order.fees || 0), // Convert bigint to integer, default 0
      due: Number(order.due), // Convert bigint to integer
      items: convertItems(order.items, itemIdMapping),
      status: mapOrderStatus(order.status),
      description: order.description,
      tx_hash: order.tx_hash,
      type: mapOrderType(order.type),
      account: order.account ?? '',
      terminal: order.pos, // Renamed field
      token: order.token
    };

    ordersToInsert.push({
      originalOrderId,
      orderData,
      placeId
    });
  }

  console.log(`Prepared ${ordersToInsert.length} orders for insertion`);

  // Process orders with controlled concurrency
  const CONCURRENCY = 20; // Process 20 orders concurrently
  let processedCount = 0;

  for (let i = 0; i < ordersToInsert.length; i += CONCURRENCY) {
    const batch = ordersToInsert.slice(i, i + CONCURRENCY);
    processedCount += batch.length;

    if (
      processedCount % 100 === 0 ||
      processedCount === ordersToInsert.length
    ) {
      console.log(
        `Processing orders ${processedCount}/${ordersToInsert.length}...`
      );
    }

    // Process batch in parallel
    const batchPromises = batch.map(async ({ originalOrderId, orderData }) => {
      try {
        // Check if order already exists before attempting to insert
        // Use a combination of fields that uniquely identifies an order
        const orderDataTyped = orderData as {
          place_id: string;
          account: string;
          created_at: string;
          total: number;
          fees: number;
          tx_hash?: string | null;
        };

        // Build query to check for existing order
        let existingOrderQuery = remoteClient
          .from('orders')
          .select('id')
          .eq('place_id', orderDataTyped.place_id)
          .eq('account', orderDataTyped.account)
          .eq('created_at', orderDataTyped.created_at)
          .eq('total', orderDataTyped.total)
          .eq('fees', orderDataTyped.fees);

        // If tx_hash exists, use it as an additional check (more reliable)
        if (orderDataTyped.tx_hash) {
          existingOrderQuery = existingOrderQuery.eq(
            'tx_hash',
            orderDataTyped.tx_hash
          );
        }

        const { data: existingOrder, error: checkError } =
          await existingOrderQuery.maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 = no rows returned (expected when order doesn't exist)
          throw checkError;
        }

        if (existingOrder) {
          // Order already exists, skip insertion
          orderMapping[originalOrderId] = existingOrder.id;
          existingOrdersCount++;
        } else {
          // Order doesn't exist, proceed with insertion
          const { data: insertedOrder, error: insertError } = await remoteClient
            .from('orders')
            .insert(orderData)
            .select('id')
            .single();

          if (insertError) {
            console.error(
              `Error inserting order ${originalOrderId}:`,
              insertError
            );
            ordersErrorCount++;
          } else if (insertedOrder) {
            orderMapping[originalOrderId] = insertedOrder.id;
            newOrdersCount++;
          }
        }
      } catch (err) {
        console.error(
          `Unexpected error migrating order ${originalOrderId}:`,
          err
        );
        ordersErrorCount++;
      }
    });

    // Wait for current batch to complete before moving to next
    await Promise.all(batchPromises);
  }

  console.log('Orders migration completed');
  console.log('Order ID mapping:', orderMapping);

  // Final summary
  console.log('\n=== ORDERS MIGRATION SUMMARY ===');
  console.log(`Total orders found: ${sourceOrders?.length || 0}`);
  console.log(`Orders with valid fields: ${validOrders.length}`);
  console.log(`New orders migrated: ${newOrdersCount}`);
  console.log(`Existing orders found: ${existingOrdersCount}`);
  console.log(`Failed migrations: ${ordersErrorCount}`);
  console.log(`Orders skipped due to missing places: ${skippedPlaceCount}`);
  console.log(`Orders skipped due to missing fields: ${skippedOrders.length}`);
  console.log('==================================\n');
};

main();
