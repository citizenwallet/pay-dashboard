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
 */
const convertItems = (items: unknown): unknown[] => {
  if (!items || !Array.isArray(items)) {
    return []; // Default empty array from destination schema
  }
  return items;
};

/**
 * This script migrates orders from the source schema to the destination schema.
 * It queries the destination database directly for place IDs using original_place_id.
 *
 * IDEMPOTENCY FEATURES:
 * - Orders are checked by a combination of fields before insertion to prevent duplicates
 * - Existing records are skipped and their IDs are logged
 * - Place IDs are fetched directly from destination database using original_place_id column
 *
 * ORDERS MIGRATION - Source schema fields mapped:
 * - place_id -> place_id (queried from destination DB using original_place_id)
 * - created_at -> created_at
 * - total -> total (bigint to integer)
 * - fees -> fees (bigint to integer, default 0)
 * - due -> due (bigint to integer)
 * - items -> items (jsonb array, default empty array)
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
  console.log('Inserting orders into destination...');

  const orderMapping: { [key: number]: number } = {}; // original_id -> new_id
  let newOrdersCount = 0;
  let existingOrdersCount = 0;
  let ordersErrorCount = 0;
  let skippedPlaceCount = 0;

  for (const order of validOrders) {
    const originalOrderId = order.id;

    try {
      // Fetch place ID from destination database
      const placeId = await fetchPlaceId(remoteClient, order.place_id);

      if (!placeId) {
        console.log(
          `Skipping order ${originalOrderId} - place not found in destination (original_place_id: ${order.place_id})`
        );
        skippedPlaceCount++;
        continue;
      }

      // Prepare order data
      const orderData = {
        place_id: placeId,
        created_at: order.created_at,
        total: Number(order.total), // Convert bigint to integer
        fees: Number(order.fees || 0), // Convert bigint to integer, default 0
        due: Number(order.due), // Convert bigint to integer
        items: convertItems(order.items),
        status: mapOrderStatus(order.status),
        description: order.description,
        tx_hash: order.tx_hash,
        type: mapOrderType(order.type),
        account: order.account ?? '',
        terminal: order.pos, // Renamed field
        token: order.token
      };

      // Check if order already exists by a combination of unique fields
      // Using place_id, account, created_at, and total as a unique identifier
      const { data: existingOrder, error: checkError } = await remoteClient
        .from('orders')
        .select('id')
        .eq('place_id', placeId)
        .eq('account', order.account)
        .eq('created_at', order.created_at)
        .eq('total', order.total)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingOrder) {
        console.log(
          `Order already exists, skipping: Order ID ${originalOrderId} (Place: ${placeId}, Account: ${order.account}, Total: ${order.total})`
        );
        orderMapping[originalOrderId] = existingOrder.id;
        existingOrdersCount++;
      } else {
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
        } else {
          console.log(
            `Successfully migrated order: ${originalOrderId} -> ${insertedOrder.id} (Place: ${placeId}, Total: ${order.total})`
          );
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
  }

  console.log('Orders migration completed');
  console.log('Order ID mapping:', orderMapping);

  // Save order mapping to file for potential future use
  const orderMappingPath = path.join(__dirname, 'order_mapping.json');
  fs.writeFileSync(orderMappingPath, JSON.stringify(orderMapping, null, 2));
  console.log(`Order mapping saved to: ${orderMappingPath}`);

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
