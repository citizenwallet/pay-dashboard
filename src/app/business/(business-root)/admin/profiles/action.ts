'use server';

import {
  BundlerService,
  CommunityConfig,
  getAccountAddress,
  getProfileFromUsername,
  getProfileUriFromId,
  ProfileWithTokenId
} from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { NextResponse } from 'next/server';
import { unpin } from '@/services/pinata/pinata';
import { Wallet } from 'ethers';
import { isUserAdminAction } from '@/actions/session';
import { revalidatePath } from 'next/cache';
import { getCidFromUri } from '@/utils/ipfs';

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

export async function deleteProfile(profile: ProfileWithTokenId) {
  const isAdmin = await isUserAdminAction();

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const community = new CommunityConfig(Config);

  const uri = await getProfileUriFromId(community, BigInt(profile.token_id));

  if (!uri) {
    return NextResponse.json(
      { error: 'Failed to get profile URI' },
      { status: 500 }
    );
  }

  const defaultCardProfileImage =
    process.env.DEFAULT_SHOP_PROFILE_IMAGE_IPFS_HASH;
  if (!defaultCardProfileImage) {
    throw new Error('Default shop profile image not found');
  }

  console.log('uri to unpin', uri);

  const unpinResponse = await unpin(uri);

  if (!unpinResponse?.ok) {
    return NextResponse.json(
      { error: 'Failed to unpin profile' },
      { status: 500 }
    );
  }

  const smallCid = getCidFromUri(profile.image_small);
  const mediumCid = getCidFromUri(profile.image_medium);
  const largeCid = getCidFromUri(profile.image);

  const toUnpin = [];
  if (smallCid !== defaultCardProfileImage) {
    toUnpin.push(smallCid);
  }
  if (mediumCid !== defaultCardProfileImage) {
    toUnpin.push(mediumCid);
  }
  if (largeCid !== defaultCardProfileImage) {
    toUnpin.push(largeCid);
  }

  await Promise.all(toUnpin.map(unpin));

  const profileManagerPrivateKey = process.env.PROFILE_MANAGER_PRIVATE_KEY;
  if (!profileManagerPrivateKey) {
    return NextResponse.json(
      { error: 'Profile manager private key not found' },
      { status: 500 }
    );
  }

  const signer = new Wallet(profileManagerPrivateKey);

  const profileManagerAddress = await getAccountAddress(
    community,
    signer.address
  );
  if (!profileManagerAddress) {
    return NextResponse.json(
      { error: 'Failed to get profile manager address' },
      { status: 500 }
    );
  }

  const bundler = new BundlerService(community);

  const tx = await bundler.burnProfile(
    signer,
    profileManagerAddress,
    profile.account
  );

  await bundler.awaitSuccess(tx);

  revalidatePath(`/business/admin/profiles?username=${profile.username}`);
}
