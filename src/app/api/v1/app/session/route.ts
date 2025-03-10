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
  verifySessionConfirm,
  verifySessionRequest
} from '@/cw/session';
import { getAddress, Wallet } from 'ethers';
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

  const sessionRequest: SessionRequest = await req.json();

  if (sessionRequest.provider !== getAddress(signer.address)) {
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

  const challenge = await generateSessionChallenge();

  const sessionRequestHash = generateSessionRequestHash(
    sessionRequest.provider,
    sessionRequest.owner,
    sessionSalt,
    sessionRequest.expiry
  );

  const sessionHash = generateSessionHash(sessionRequestHash, challenge);

  const signedSessionHash = await signer.signMessage(sessionHash);

  // TODO: add 2fa provider to community config
  const community = new CommunityConfig(communityJson);

  const txHash = await requestSession(
    community,
    signer,
    '0xE544c1dC66f65967863F03AEdEd38944E6b87309',
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

  const sessionRequest: SessionConfirm = await req.json();

  if (sessionRequest.provider !== getAddress(signer.address)) {
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

  const txHash = await confirmSession(
    community,
    signer,
    '0xE544c1dC66f65967863F03AEdEd38944E6b87309',
    sessionRequest.sessionRequestHash,
    sessionRequest.sessionHash,
    sessionRequest.signedSessionHash
  );

  return NextResponse.json({
    sessionConfirmTxHash: txHash,
    status: StatusCodes.OK
  });
}
