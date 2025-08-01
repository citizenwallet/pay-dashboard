'use server';

import { auth } from '@/auth';
import { getServiceRoleClient } from '@/db';
import { checkUserAccessBusiness } from '@/db/business';
import { isOwnerOfBusiness } from '@/db/businessUser';
import { checkUserPlaceAccess } from '@/db/places';
import { isAdmin, getUserById } from '@/db/users';
import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function getUserIdFromSessionAction() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  if (typeof session.user.id !== 'string') {
    throw new Error('User ID is not a string');
  }

  return parseInt(session.user.id);
}

export async function getUserFromSessionAction() {
  const userId = await getUserIdFromSessionAction();
  const client = getServiceRoleClient();
  const { data, error } = await getUserById(client, userId);
  if (error) {
    redirect('/login');
  }
  return data;
}

export async function isUserAdminAction() {
  const userId = await getUserIdFromSessionAction();

  const client = getServiceRoleClient();
  return await isAdmin(client, userId);
}

export async function isUserLinkedToPlaceAction(
  client: SupabaseClient,
  userId: number,
  placeId: number
) {
  if (await isAdmin(client, userId)) {
    return true;
  }

  const isLinked = await checkUserPlaceAccess(client, userId, placeId);

  return isLinked;
}

export async function isUserLinkedToBusinessAction(
  client: SupabaseClient,
  userId: number,
  businessId: number
) {
  if (await isAdmin(client, userId)) {
    return true;
  }

  const isLinked = await checkUserAccessBusiness(client, userId, businessId);

  return isLinked;
}

export async function isUserOwnerOrAdminOfBusinessAction(
  client: SupabaseClient,
  userId: number,
  businessId: number
) {
  if (await isAdmin(client, userId)) {
    return true;
  }
  return await isOwnerOfBusiness(client, userId, businessId);
}
