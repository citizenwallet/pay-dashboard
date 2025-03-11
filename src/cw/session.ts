import sessionManagerModuleJson from '@/cw/abi/SessionManagerModule.json';
import { generateOtp } from '@/utils/generateotp';
import { BundlerService, CommunityConfig } from '@citizenwallet/sdk';
import {
  solidityPackedKeccak256,
  id,
  verifyMessage,
  Wallet,
  Interface,
  getBytes
} from 'ethers';

const sessionManagerInterface = new Interface(sessionManagerModuleJson.abi);

// TODO: move to SDK

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

  return recoveredAddress === sessionOwner;
};

export const verifySessionConfirm = async (
  sessionOwner: string,
  sessionHash: string,
  signedSessionHash: string
) => {
  const recoveredAddress = verifyMessage(sessionHash, signedSessionHash);

  return recoveredAddress === sessionOwner;
};

export const requestSession = async (
  community: CommunityConfig,
  signer: Wallet,
  provider: string,
  sessionSalt: string,
  sessionRequestHash: string,
  signedSessionRequestHash: string,
  signedSessionHash: string,
  sessionRequestExpiry: number
): Promise<string> => {
  const sessionManagerAddress = '0xE544c1dC66f65967863F03AEdEd38944E6b87309';

  const bundler = new BundlerService(community);

  const data = getBytes(
    sessionManagerInterface.encodeFunctionData('request', [
      sessionSalt,
      sessionRequestHash,
      signedSessionRequestHash,
      signedSessionHash,
      sessionRequestExpiry
    ])
  );

  const tx = await bundler.call(signer, sessionManagerAddress, provider, data);

  return tx;
};

export const confirmSession = async (
  community: CommunityConfig,
  signer: Wallet,
  provider: string,
  sessionRequestHash: string,
  sessionHash: string,
  signedSessionHash: string
) => {
  const sessionManagerAddress = '0xE544c1dC66f65967863F03AEdEd38944E6b87309';

  const bundler = new BundlerService(community);

  const data = getBytes(
    sessionManagerInterface.encodeFunctionData('confirm', [
      sessionRequestHash,
      sessionHash,
      signedSessionHash
    ])
  );

  const tx = await bundler.call(signer, sessionManagerAddress, provider, data);

  return tx;
};
