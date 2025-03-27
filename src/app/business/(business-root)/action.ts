'use server';
import { getServiceRoleClient } from '@/db';
import { getAllBusiness } from '@/db/business';

export async function getAllBusinessAction() {
  const client = getServiceRoleClient();
  const businesses = await getAllBusiness(client);
  return businesses.data;
}
