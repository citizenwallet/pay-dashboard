'use server';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import '@/lib/utils';
import {
  confirmSession,
  generateSessionChallenge,
  generateSessionHash,
  generateSessionRequestHash,
  generateSessionSalt,
  requestSession,
  verifyIncomingSessionRequest,
  verifySessionConfirm,
  verifySessionRequest
} from '@/cw/session';
import { getBytes, Wallet } from 'ethers';
import communityJson from '@/cw/community.json';
import { CommunityConfig } from '@citizenwallet/sdk';
import { sendOtpSMS } from '@/services/brevo';
import {
  createSessionRequest,
  getDailySessionRequestCount,
  getImmediateSessionRequestCount,
  getRecentSessionRequestCount
} from '@/db/sessionRequest';
import { getServiceRoleClient } from '@/db';

interface SessionRequest {
  provider: string;
  owner: string;
  source: string;
  type: string;
  expiry: number;
  signature: string;
}

const demoSalt =
  '0xd6e1d3bc4b24de2d3b22e2be6a0fd377657b338064a0e8fc21690c160d9999cd';

export async function POST(req: NextRequest) {
  const providerPrivateKey = process.env.PROVIDER_PRIVATE_KEY;

  if (!providerPrivateKey) {
    return NextResponse.json(
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR, // 500
        message: ReasonPhrases.INTERNAL_SERVER_ERROR // "Internal Server Error" message
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR // Using the 500 constant
      }
    );
  }

  const signer = new Wallet(providerPrivateKey);

  const community = new CommunityConfig(communityJson);

  const sessionManager = community.primarySessionConfig;

  const sessionRequest: SessionRequest = await req.json();

  if (sessionRequest.provider !== sessionManager.provider_address) {
    return NextResponse.json({
      status: StatusCodes.BAD_REQUEST, // 400
      message: ReasonPhrases.BAD_REQUEST // "Bad Request" message
    });
  }

  const isValid = await verifySessionRequest(
    sessionRequest.provider,
    sessionRequest.owner,
    sessionRequest.source,
    sessionRequest.type,
    sessionRequest.expiry,
    sessionRequest.signature
  );

  if (!isValid) {
    return NextResponse.json(
      {
        status: StatusCodes.BAD_REQUEST, // 400
        message: ReasonPhrases.BAD_REQUEST // "Bad Request" message
      },
      {
        status: StatusCodes.BAD_REQUEST // Using the 400 constant
      }
    );
  }

  if (sessionRequest.type !== 'sms') {
    return NextResponse.json({
      status: StatusCodes.BAD_REQUEST, // 400
      message: ReasonPhrases.BAD_REQUEST // "Bad Request" message
    });
  }

  const sessionSalt = generateSessionSalt(
    sessionRequest.source,
    sessionRequest.type
  );

  const client = getServiceRoleClient();

  // max 1 request per 30 seconds
  const immediateSessionRequestCount = await getImmediateSessionRequestCount(
    client,
    sessionSalt
  );

  if (immediateSessionRequestCount > 0) {
    return NextResponse.json({
      status: StatusCodes.TOO_MANY_REQUESTS, // 429
      message: ReasonPhrases.TOO_MANY_REQUESTS // "Too Many Requests" message
    });
  }

  // max 3 requests per 10 minutes
  const recentSessionRequestCount = await getRecentSessionRequestCount(
    client,
    sessionSalt
  );

  if (recentSessionRequestCount >= 3) {
    return NextResponse.json({
      status: StatusCodes.TOO_MANY_REQUESTS, // 429
      message: ReasonPhrases.TOO_MANY_REQUESTS // "Too Many Requests" message
    });
  }

  // max 20 requests per day
  const dailySessionRequestCount = await getDailySessionRequestCount(
    client,
    sessionSalt
  );

  if (dailySessionRequestCount >= 20) {
    return NextResponse.json({
      status: StatusCodes.TOO_MANY_REQUESTS, // 429
      message: ReasonPhrases.TOO_MANY_REQUESTS // "Too Many Requests" message
    });
  }

  const sessionRequestHash = generateSessionRequestHash(
    sessionRequest.provider,
    sessionRequest.owner,
    sessionSalt,
    sessionRequest.expiry
  );

  let challenge = await generateSessionChallenge();
  if (sessionSalt === demoSalt) {
    challenge = 123456;
  }

  const sessionHash = generateSessionHash(sessionRequestHash, challenge);

  const signedSessionHash = await signer.signMessage(getBytes(sessionHash));

  const txHash = await requestSession(
    community,
    signer,
    sessionManager.provider_address,
    sessionSalt,
    sessionRequestHash,
    sessionRequest.signature,
    signedSessionHash,
    sessionRequest.expiry
  );

  if (sessionSalt !== demoSalt) {
    await sendOtpSMS(sessionRequest.source, challenge);

    await createSessionRequest(client, sessionSalt);
  }

  return NextResponse.json({
    sessionRequestTxHash: txHash,
    status: StatusCodes.OK
  });
}

interface SessionConfirm {
  provider: string;
  owner: string;
  sessionRequestHash: string;
  sessionHash: string;
  signedSessionHash: string;
}

export async function PATCH(req: NextRequest) {
  const providerPrivateKey = process.env.PROVIDER_PRIVATE_KEY;

  if (!providerPrivateKey) {
    return NextResponse.json(
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR, // 500
        message: ReasonPhrases.INTERNAL_SERVER_ERROR // "Internal Server Error" message
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR // Using the 500 constant
      }
    );
  }

  const signer = new Wallet(providerPrivateKey);

  const community = new CommunityConfig(communityJson);

  const sessionManager = community.primarySessionConfig;

  const providerAccountAddress = sessionManager.provider_address;
  if (!providerAccountAddress) {
    return NextResponse.json(
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR, // 500
        message: ReasonPhrases.INTERNAL_SERVER_ERROR // "Internal Server Error" message
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR // Using the 500 constant
      }
    );
  }

  const sessionRequest: SessionConfirm = await req.json();
  if (sessionRequest.provider !== providerAccountAddress) {
    return NextResponse.json({
      status: StatusCodes.BAD_REQUEST, // 400
      message: ReasonPhrases.BAD_REQUEST // "Bad Request" message
    });
  }

  const isValid = await verifySessionConfirm(
    sessionRequest.owner,
    sessionRequest.sessionHash,
    sessionRequest.signedSessionHash
  );

  if (!isValid) {
    return NextResponse.json(
      {
        status: StatusCodes.BAD_REQUEST, // 400
        message: ReasonPhrases.BAD_REQUEST // "Bad Request" message
      },
      {
        status: StatusCodes.BAD_REQUEST // Using the 400 constant
      }
    );
  }

  const isSessionHashValid = await verifyIncomingSessionRequest(
    community,
    signer,
    providerAccountAddress,
    sessionRequest.sessionRequestHash,
    sessionRequest.sessionHash
  );

  if (!isSessionHashValid) {
    return NextResponse.json(
      {
        status: StatusCodes.BAD_REQUEST, // 400
        message: ReasonPhrases.BAD_REQUEST // "Bad Request" message
      },
      {
        status: StatusCodes.BAD_REQUEST // Using the 400 constant
      }
    );
  }

  const txHash = await confirmSession(
    community,
    signer,
    providerAccountAddress,
    sessionRequest.sessionRequestHash,
    sessionRequest.sessionHash,
    sessionRequest.signedSessionHash
  );

  return NextResponse.json({
    sessionConfirmTxHash: txHash,
    status: StatusCodes.OK
  });
}
