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
 * Validates if a POS record has all required fields for migration
 */
const isValidPos = (pos: {
  id?: string | null;
  place_id?: number | null;
  name?: string | null;
  type?: string | null;
}): boolean => {
  return !!(pos.id && pos.place_id && pos.name && pos.type);
};

/**
 * Map POS type from source to destination
 */
const mapPosType = (sourceType: string | null): string => {
  switch (sourceType) {
    case 'viva':
      return 'viva';
    case 'app':
      return 'app';
    default:
      return 'app'; // Default value from destination schema
  }
};

/**
 * This script migrates POS records from the source schema to the destination schema.
 * It queries the destination database directly for place IDs using original_place_id.
 *
 * IDEMPOTENCY FEATURES:
 * - Terminals are checked by ID before insertion to prevent duplicates
 * - Existing records are skipped and their IDs are logged
 * - Place IDs are fetched directly from destination database using original_place_id column
 *
 * TERMINALS MIGRATION - Source schema fields mapped:
 * - id -> id (text, primary key)
 * - place_id -> place_id (queried from destination DB using original_place_id)
 * - name -> name (text, required)
 * - type -> type (mapped to valid enum values: 'viva' or 'app')
 * - is_active -> active (boolean, inverted logic: is_active=false becomes active=true)
 * - created_at -> created_at
 * - updated_at -> updated_at (set to current timestamp)
 * - last_active_at -> last_active_at (null, not available in source)
 *
 * Fields not migrated (source has more info):
 * - None - all fields are mapped
 */
const main = async () => {
  const remoteUrl = process.argv[2];
  const remoteKey = process.argv[3];
  if (!remoteUrl || !remoteKey) {
    console.error('Usage: node scripts/migrate_terminals.ts <url> <key>');
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

  // No need to fetch place mapping - we'll query directly for each POS record

  // migrate POS records from public.pos to public.terminals
  console.log('Starting terminals migration...');

  // Fetch POS records from source public.pos table
  const { data: sourcePos, error: posFetchError } = await client
    .from('pos')
    .select('*');

  if (posFetchError) {
    console.error('Error fetching POS records from source:', posFetchError);
    return;
  }

  console.log(`Found ${sourcePos?.length || 0} POS records to migrate`);

  if (!sourcePos || sourcePos.length === 0) {
    console.log('No POS records to migrate');
    return;
  }

  // Log POS records that will be skipped
  const skippedPos = sourcePos.filter((pos) => {
    const hasValidFields = isValidPos(pos);

    if (!hasValidFields) {
      console.log(
        `Skipping POS ${
          pos.id || 'unknown'
        } - missing required fields (id, place_id, name, or type)`
      );
    }

    return !hasValidFields;
  });

  console.log(
    `Skipping ${skippedPos.length} POS records due to missing required fields`
  );

  // Filter POS records with valid fields
  const validPos = sourcePos.filter((pos) => isValidPos(pos));
  console.log(`Found ${validPos.length} POS records with valid fields`);

  // Insert terminals into destination table using the remote client
  console.log('Inserting terminals into destination...');

  const terminalMapping: { [key: string]: string } = {}; // original_id -> new_id
  let newTerminalsCount = 0;
  let existingTerminalsCount = 0;
  let terminalsErrorCount = 0;
  let skippedPlaceCount = 0;

  for (const pos of validPos) {
    const originalPosId = pos.id;

    try {
      // Fetch place ID from destination database
      const placeId = await fetchPlaceId(remoteClient, pos.place_id);

      if (!placeId) {
        console.log(
          `Skipping POS ${originalPosId} - place not found in destination (original_place_id: ${pos.place_id})`
        );
        skippedPlaceCount++;
        continue;
      }

      // Prepare terminal data
      const terminalData = {
        id: pos.id,
        place_id: placeId,
        name: pos.name,
        type: mapPosType(pos.type),
        active: !pos.is_active, // Invert the logic: is_active=false becomes active=true
        created_at: pos.created_at,
        updated_at: new Date().toISOString(),
        last_active_at: null // Not available in source
      };

      // Check if terminal already exists by ID
      const { data: existingTerminal, error: checkError } = await remoteClient
        .from('terminals')
        .select('id')
        .eq('id', pos.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingTerminal) {
        console.log(
          `Terminal already exists, skipping: ${originalPosId} (Place: ${placeId}, Name: ${pos.name})`
        );
        terminalMapping[originalPosId] = existingTerminal.id;
        existingTerminalsCount++;
      } else {
        const { data: insertedTerminal, error: insertError } =
          await remoteClient
            .from('terminals')
            .insert(terminalData)
            .select('id')
            .single();

        if (insertError) {
          console.error(
            `Error inserting terminal ${originalPosId}:`,
            insertError
          );
          terminalsErrorCount++;
        } else {
          console.log(
            `Successfully migrated terminal: ${originalPosId} -> ${insertedTerminal.id} (Place: ${placeId}, Name: ${pos.name})`
          );
          terminalMapping[originalPosId] = insertedTerminal.id;
          newTerminalsCount++;
        }
      }
    } catch (err) {
      console.error(
        `Unexpected error migrating terminal ${originalPosId}:`,
        err
      );
      terminalsErrorCount++;
    }
  }

  console.log('Terminals migration completed');
  console.log('Terminal ID mapping:', terminalMapping);

  // Save terminal mapping to file for potential future use
  const terminalMappingPath = path.join(__dirname, 'terminal_mapping.json');
  fs.writeFileSync(
    terminalMappingPath,
    JSON.stringify(terminalMapping, null, 2)
  );
  console.log(`Terminal mapping saved to: ${terminalMappingPath}`);

  // Final summary
  console.log('\n=== TERMINALS MIGRATION SUMMARY ===');
  console.log(`Total POS records found: ${sourcePos?.length || 0}`);
  console.log(`POS records with valid fields: ${validPos.length}`);
  console.log(`New terminals migrated: ${newTerminalsCount}`);
  console.log(`Existing terminals found: ${existingTerminalsCount}`);
  console.log(`Failed migrations: ${terminalsErrorCount}`);
  console.log(`Terminals skipped due to missing places: ${skippedPlaceCount}`);
  console.log(`Terminals skipped due to missing fields: ${skippedPos.length}`);
  console.log('====================================\n');
};

main();
