import {
  generateSessionSalt,
  generateSessionRequestHash,
  verifySessionRequest
} from '@/cw/session';

describe('generateSessionSalt', () => {
  it('should generate the correct hash for given source and type', () => {
    const source = '+32478121212';
    const type = 'sms';

    const expectedHash =
      '0xd6e1d3bc4b24de2d3b22e2be6a0fd377657b338064a0e8fc21690c160d9999cd';

    const result = generateSessionSalt(source, type);

    expect(result).toBe(expectedHash);
  });
});

describe('generateSessionRequestHash', () => {
  it('should generate the correct hash for given parameters', () => {
    const sessionProvider = '0xF3004A1690f97Cf5d307eDc5958a7F76b62f9FC9';
    const sessionOwner = '0x1720Ffd9fa543dbB0C186a2C807E4e7B5f6645f5';
    const salt =
      '0xd6e1d3bc4b24de2d3b22e2be6a0fd377657b338064a0e8fc21690c160d9999cd';
    const expiry = 1742457473;

    const expectedHash =
      '0xa4ae527f4b6827ece71e448a8ed82ba379a2d7a4ae5220a2e56f4989ba452f32';

    const result = generateSessionRequestHash(
      sessionProvider,
      sessionOwner,
      salt,
      expiry
    );

    expect(result).toBe(expectedHash);
  });
});

describe('verifySessionRequest', () => {
  it('should generate and verify the correct session request hash', async () => {
    const sessionProvider = '0xF3004A1690f97Cf5d307eDc5958a7F76b62f9FC9';
    const sessionOwner = '0x6d5e74F5Aa65CB4133a3e28EAD2c638D1F1A6930';
    const source = '+32478121212';
    const type = 'sms'; // assuming SMS type based on the phone number
    const expiry = 1742472928;
    const signature =
      '0x0eb5dcd5d30a264538fa7e74173d6f7e95193ae906808293ddb71e53cbdb41075e9f33ecda19579daf42b0358f2958cb9b130796c59e1aaa47885d376b9f962d1c';

    const isValid = await verifySessionRequest(
      sessionProvider,
      sessionOwner,
      source,
      type,
      expiry,
      signature
    );
    expect(isValid).toBe(true);
  });
});
