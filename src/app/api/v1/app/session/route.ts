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

interface SessionRequest {
  provider: string;
  owner: string;
  source: string;
  type: string;
  expiry: number;
  signature: string;
}

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

  const providerAccountAddress = process.env.PROVIDER_ACCOUNT_ADDRESS;
  if (!providerAccountAddress) {
    return NextResponse.json({
      status: StatusCodes.INTERNAL_SERVER_ERROR, // 500
      message: ReasonPhrases.INTERNAL_SERVER_ERROR // "Internal Server Error" message
    });
  }

  const sessionRequest: SessionRequest = await req.json();

  if (sessionRequest.provider !== providerAccountAddress) {
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

  const sessionRequestHash = generateSessionRequestHash(
    sessionRequest.provider,
    sessionRequest.owner,
    sessionSalt,
    sessionRequest.expiry
  );

  const challenge = await generateSessionChallenge();

  const sessionHash = generateSessionHash(sessionRequestHash, challenge);

  const signedSessionHash = await signer.signMessage(getBytes(sessionHash));

  // TODO: add 2fa provider to community config
  const community = new CommunityConfig(communityJson);

  const txHash = await requestSession(
    community,
    signer,
    providerAccountAddress,
    sessionSalt,
    sessionRequestHash,
    sessionRequest.signature,
    signedSessionHash,
    sessionRequest.expiry
  );

  await sendOtpSMS(sessionRequest.source, challenge);

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

  const providerAccountAddress = process.env.PROVIDER_ACCOUNT_ADDRESS;
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

  // TODO: add 2fa provider to community config
  const community = new CommunityConfig(communityJson);

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
