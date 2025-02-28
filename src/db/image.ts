import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

export const uploadImage = async (
  client: SupabaseClient,
  image: File,
  business_id: number,
  place_id: number
): Promise<string> => {
    let url = '';
    const fileName = `${Date.now()}-${image.name}`;
    const { data, error } = await client.storage
      .from(`uploads/${business_id}/${place_id}`)
      .upload(fileName, image);

    if (error) {
      throw error;
    }
    url = await client.storage
      .from(`uploads/${business_id}/${place_id}`)
      .getPublicUrl(fileName).data.publicUrl;

    return url;
}