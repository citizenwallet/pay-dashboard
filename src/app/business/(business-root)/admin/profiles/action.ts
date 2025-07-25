'use server';

import {
  CommunityConfig,
  getProfileFromUsername,
  ProfileWithTokenId
} from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { NextResponse } from 'next/server';
import { isUserAdminAction } from '@/actions/session';
import { revalidatePath } from 'next/cache';
import { deleteProfile } from '@/cw/profiles';

export async function getProfile(username: string) {
  const isAdmin = await isUserAdminAction();

  if (!isAdmin) {
    return null;
  }

  try {
    const ipfsDomain = process.env.IPFS_DOMAIN;
    if (!ipfsDomain) {
      return null;
    }

    const community = new CommunityConfig(Config);
    const profile = await getProfileFromUsername(
      ipfsDomain,
      community,
      username
    );
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function deleteProfileAction(profile: ProfileWithTokenId) {
  const isAdmin = await isUserAdminAction();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const community = new CommunityConfig(Config);

  try {
    await deleteProfile(community, profile.account);
  } catch (error) {
    console.error('Error deleting profile:', error);
  }

  revalidatePath(`/business/admin/profiles?username=${profile.username}`);
}
