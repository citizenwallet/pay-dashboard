'use server';
import Config from '@/cw/community.json';
import { getServiceRoleClient } from '@/db';
import { upsertPlaceBalance } from '@/db/placeBalance';
import { getAllPlacesWithBusiness } from '@/db/places';
import { CommunityConfig, getAccountBalance } from '@citizenwallet/sdk';
import { formatUnits } from 'ethers';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

// This API route will be called by a cron job every 15 minutes
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401
      });
    }
    //update the place balance
    const client = getServiceRoleClient();
    const { data } = await getAllPlacesWithBusiness(client);
    const community = new CommunityConfig(Config);
    const token = community.primaryToken.address;
    if (data) {
      data.map(async (place) => {
        const balance = await getAccountBalance(community, place.accounts[0]);
        if (!balance) {
          return;
        }
        const formattedBalance =
          Number(formatUnits(balance, community.primaryToken.decimals)) * 100;
        await upsertPlaceBalance(client, {
          token: token,
          place_id: place.id,
          balance: formattedBalance
        });
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Business sync cron job completed successfully',
        timestamp: new Date().toISOString()
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error('Business sync cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
