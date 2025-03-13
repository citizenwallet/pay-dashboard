import sessionManagerModuleJson from '@/cw/abi/SessionManagerModule.json';
import { generateOtp } from '@/utils/generateotp';
import { BundlerService, CommunityConfig } from '@citizenwallet/sdk';
import {
  solidityPackedKeccak256,
  id,
  verifyMessage,
  Wallet,
  Interface,
  getBytes,
  JsonRpcProvider,
  Contract,
  hexlify
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

  console.log('sessionRequestHash', sessionRequestHash);
  console.log('sessionHash', sessionHash);
  console.log('signedSessionHash', signedSessionHash);

  const data = getBytes(
    sessionManagerInterface.encodeFunctionData('confirm', [
      sessionRequestHash,
      sessionHash,
      signedSessionHash
    ])
  );

  console.log('data', hexlify(data));

  const tx = await bundler.call(signer, sessionManagerAddress, provider, data);

  console.log('tx', tx);

  return tx;
};

/**
 * Verifies an incoming session request by comparing the provided signedSessionHash
 * with a newly generated signature of the sessionHash using the signer
 *
 * @param community - Community configuration
 * @param signer - Wallet used for signing
 * @param provider - Session provider address
 * @param sessionRequestHash - Hash of the session request
 * @param sessionHash - Hash of the session
 * @param signedSessionHash - Signature of the session hash to verify
 * @returns Promise<boolean> - True if the signature is valid
 */
export const verifyIncomingSessionRequest = async (
  community: CommunityConfig,
  signer: Wallet,
  provider: string,
  sessionRequestHash: string,
  sessionHash: string
): Promise<boolean> => {
  try {
    // Get the session manager contract address
    const sessionManagerAddress = '0xE544c1dC66f65967863F03AEdEd38944E6b87309';

    const rpcProvider = new JsonRpcProvider(community.primaryRPCUrl);

    const contract = new Contract(
      sessionManagerAddress,
      sessionManagerInterface,
      rpcProvider
    );

    console.log('provider: ', provider);
    console.log('sessionRequestHash: ', sessionRequestHash);

    const result = await contract.sessionRequests(provider, sessionRequestHash);

    console.log('result', result);
    if (result.length < 5) {
      throw new Error('Session request not found');
    }

    // check the expiry
    const expiry = Number(result[0]);
    const now = Math.floor(Date.now() / 1000);
    if (expiry < now) {
      throw new Error('Session request expired');
    }

    // Extract the stored signedSessionHash from the result
    const storedSignedSessionHash = result[1];

    console.log('storedSignedSessionHash', storedSignedSessionHash);

    // Sign the provided sessionHash with the signer
    const calculatedSignedSessionHash = await signer.signMessage(sessionHash);

    console.log('calculatedSignedSessionHash', calculatedSignedSessionHash);

    // Compare the stored signedSessionHash with the provided one
    return storedSignedSessionHash === calculatedSignedSessionHash;
  } catch (error) {
    console.error('Error verifying incoming session request:', error);
    return false;
  }
};
