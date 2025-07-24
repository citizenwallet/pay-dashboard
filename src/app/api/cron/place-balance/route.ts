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
  console.log('place balance cron job started');
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401
      });
    }

    const client = getServiceRoleClient();
    const { data, error } = await getAllPlacesWithBusiness(client);
    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: 'No places found',
          timestamp: new Date().toISOString()
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const community = new CommunityConfig(Config);

    const tokens = community.tokens;

    for (const token of Object.values(tokens)) {
      for (const place of data) {
        let balance: bigint | null = BigInt(0);
        try {
          balance = await getAccountBalance(community, place.accounts[0], {
            tokenAddress: token.address
          });
        } catch (error) {
          console.error('Error getting account balance:', error);
        }

        const now = new Date().toISOString();

        const formattedBalance =
          Number(formatUnits(balance ?? 0, token.decimals)) * 100;
        await upsertPlaceBalance(client, {
          token: token.address,
          place_id: place.id,
          updated_at: now,
          balance: formattedBalance
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
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
