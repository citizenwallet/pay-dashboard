'use server';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';

/**
 * Simple migration endpoint that checks if the app needs to be migrated
 * Returns HTTP 451 when migration is required
 */
export async function GET(req: NextRequest) {
  try {
    const shouldMigrate = process.env.FORCE_APP_MIGRATION === 'true';

    if (shouldMigrate) {
      return NextResponse.json(
        {
          message: 'Migration required',
          code: 'MIGRATION_REQUIRED'
        },
        {
          status: StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS //451
        }
      );
    }

    return NextResponse.json(
      {
        message: 'No migration required',
        code: 'NO_MIGRATION_NEEDED'
      },
      {
        status: StatusCodes.OK
      }
    );
  } catch (error) {
    console.error('Migration check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
