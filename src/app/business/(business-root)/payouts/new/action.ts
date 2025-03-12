'use server';
import { getServiceRoleClient } from '@/db';
import { getAllPlaces } from '@/db/places';

export async function getAllPlacesAction() {
  const client = getServiceRoleClient();
  const places = await getAllPlaces(client);
  return places.data;
}
