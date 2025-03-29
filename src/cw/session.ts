import sessionManagerModuleJson from '@/cw/abi/SessionManagerModule.json';
import { generateOtp } from '@/utils/generateotp';
import { BundlerService, CommunityConfig } from '@citizenwallet/sdk';
import {
  id,
  verifyMessage,
  Wallet,
  Interface,
  getBytes,
  JsonRpcProvider,
  Contract,
  keccak256,
  AbiCoder
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
  // Use ABI encoding to match the Dart implementation
  const abiCoder = new AbiCoder();
  const packedData = abiCoder.encode(
    ['address', 'address', 'bytes32', 'uint48'],
    [sessionProvider, sessionOwner, salt, BigInt(expiry)]
  );

  const result = keccak256(packedData);
  return result;
};

export const generateSessionHash = (
  sessionRequestHash: string,
  challenge: number
) => {
  // Use ABI encoding to match the Dart implementation
  const abiCoder = new AbiCoder();
  const packedData = abiCoder.encode(
    ['bytes32', 'uint256'],
    [sessionRequestHash, BigInt(challenge)]
  );

  return keccak256(packedData);
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

  const recoveredAddress = verifyMessage(
    getBytes(sessionRequestHash),
    signature
  );

  return recoveredAddress === sessionOwner;
};

export const verifySessionConfirm = async (
  sessionOwner: string,
  sessionHash: string,
  signedSessionHash: string
) => {
  const recoveredAddress = verifyMessage(
    getBytes(sessionHash),
    signedSessionHash
  );

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
  sessionExpiry: number
): Promise<string> => {
  const sessionManagerAddress = '0x18C0F6b6C69EAA853BbE910E35881d3A5442bFc0';

  const bundler = new BundlerService(community);

  const challengeExpiry = Math.floor(Date.now() / 1000) + 120;

  const data = getBytes(
    sessionManagerInterface.encodeFunctionData('request', [
      sessionSalt,
      sessionRequestHash,
      signedSessionRequestHash,
      signedSessionHash,
      sessionExpiry,
      challengeExpiry
    ])
  );

  const tx = await bundler.call(signer, sessionManagerAddress, provider, data);

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
    const sessionManagerAddress = '0x18C0F6b6C69EAA853BbE910E35881d3A5442bFc0';

    const rpcProvider = new JsonRpcProvider(community.primaryRPCUrl);

    const contract = new Contract(
      sessionManagerAddress,
      sessionManagerInterface,
      rpcProvider
    );

    const result = await contract.sessionRequests(provider, sessionRequestHash);
    if (result.length < 5) {
      throw new Error('Session request not found');
    }

    // check the expiry
    const expiry = Number(result[0]);
    const now = Math.floor(Date.now() / 1000);
    if (expiry < now) {
      throw new Error('Session request expired');
    }

    // check the challenge expiry
    const challengeExpiry = Number(result[1]);
    if (challengeExpiry < now) {
      throw new Error('Challenge expired');
    }

    // Extract the stored signedSessionHash from the result
    const storedSignedSessionHash = result[2];

    // Sign the provided sessionHash with the signer
    const calculatedSignedSessionHash = await signer.signMessage(
      getBytes(sessionHash)
    );

    // Compare the stored signedSessionHash with the provided one
    return storedSignedSessionHash === calculatedSignedSessionHash;
  } catch (error) {
    console.error('Error verifying incoming session request:', error);
    return false;
  }
};

export const confirmSession = async (
  community: CommunityConfig,
  signer: Wallet,
  provider: string,
  sessionRequestHash: string,
  sessionHash: string,
  signedSessionHash: string
) => {
  const sessionManagerAddress = '0x18C0F6b6C69EAA853BbE910E35881d3A5442bFc0';

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
