'use server';

import { isUserAdminAction } from '@/actions/session';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { upsertProfile } from '@/cw/profiles';
import Config from '@/cw/community.json';
import { CommunityConfig } from '@citizenwallet/sdk';

interface CreateProfileData {
  address: string;
  username: string;
  name: string;
  description: string;
  image: File | null;
}

export async function createProfileAction(data: CreateProfileData) {
  const isAdmin = await isUserAdminAction();

  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  try {
    const community = new CommunityConfig(Config);
    
    // Convert image file to data URL if provided
    let imageUrl: string | null = null;
    if (data.image) {
      const arrayBuffer = await data.image.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = data.image.type;
      imageUrl = `data:${mimeType};base64,${base64}`;
    }

    await upsertProfile(
      community,
      data.username,
      data.name,
      data.address,
      data.description,
      imageUrl
    );

    revalidatePath('/business/admin/profiles');
    
    return { success: true };
  } catch (error) {
    console.error('Error creating profile:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create profile'
    );
  }
} 