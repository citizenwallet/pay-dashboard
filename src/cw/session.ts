import sessionManagerModuleJson from '@/cw/abi/SessionManagerModule.json';
import { generateOtp } from '@/utils/generateotp';
import { CommunityConfig } from '@citizenwallet/sdk';
import {
  Contract,
  solidityPackedKeccak256,
  id,
  verifyMessage,
  Wallet,
  JsonRpcProvider
} from 'ethers';

export const generateSessionSalt = (source: string, type: string) => {
  return id(`${source}:${type}`);
};

export const generateSessionRequestHash = (
  sessionProvider: string,
  sessionOwner: string,
  salt: string,
  expiry: number
) => {
  return solidityPackedKeccak256(
    ['address', 'address', 'bytes32', 'uint48'],
    [sessionProvider, sessionOwner, salt, expiry]
  );
};

export const generateSessionHash = (
  sessionRequestHash: string,
  challenge: number
) => {
  return solidityPackedKeccak256(
    ['bytes32', 'uint256'],
    [sessionRequestHash, challenge]
  );
};

export const generateSessionChallenge = () => {
  return generateOtp(6);
};

export const verifySessionRequest = async (
  sessionProvider: string,
  sessionOwner: string,
  source: string,
  type: string,
  expiry: number,
  signature: string
) => {
  const sessionSalt = generateSessionSalt(source, type);

  const sessionRequestHash = generateSessionRequestHash(
    sessionProvider,
    sessionOwner,
    sessionSalt,
    expiry
  );

  const recoveredAddress = verifyMessage(sessionRequestHash, signature);

  console.log('recoveredAddress', recoveredAddress);
  console.log('sessionOwner', sessionOwner);

  return recoveredAddress === sessionOwner;
};

export const requestSession = async (
  community: CommunityConfig,
  signer: Wallet,
  sessionManagerAddress: string,
  sessionSalt: string,
  sessionRequestHash: string,
  signedSessionRequestHash: string,
  signedSessionHash: string,
  sessionRequestExpiry: number
): Promise<string> => {
  const provider = new JsonRpcProvider(community.primaryRPCUrl);

  const connectedSigner = signer.connect(provider);

  const sessionManagerContract = new Contract(
    sessionManagerAddress,
    sessionManagerModuleJson.abi,
    connectedSigner
  );

  const tx = await sessionManagerContract.request(
    sessionSalt,
    sessionRequestHash,
    signedSessionRequestHash,
    signedSessionHash,
    sessionRequestExpiry
  );

  return tx.hash;
};
