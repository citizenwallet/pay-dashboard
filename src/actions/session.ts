'use server';

import { auth } from '@/auth';
import { checkUserPlaceAccess } from '@/db/places';
import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function getUserIdFromSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  if (typeof session.user.id !== 'string') {
    throw new Error('User ID is not a string');
  }

  return parseInt(session.user.id);
}

export async function isUserLinkedToPlace(
  client: SupabaseClient,
  userId: number,
  placeId: number
) {
  const isLinked = await checkUserPlaceAccess(client, userId, placeId);

  return isLinked;
}
