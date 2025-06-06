import {
  generateSessionHash,
  generateSessionRequestHash,
  generateSessionSalt,
  verifySessionRequest
} from '@/cw/session';
import { describe, expect, it } from '@jest/globals';
import { getAddress, Wallet } from 'ethers';

describe('CW Functions', () => {
  const sessionProvider = '0xF3004A1690f97Cf5d307eDc5958a7F76b62f9FC9';

  const source = '+32478123123';
  const type = 'sms';
  const expiry = 1741908088;

  describe('generateSessionSalt', () => {
    it('should generate session salt correctly', () => {
      const salt = generateSessionSalt(source, type);
      expect(salt).toBe(
        '0xa17d5ac59d1f162ffd45c5c5c1dd7bed559123d0372f3a16aee2224a8324cbe9'
      );
    });
  });

  describe('generateSessionRequestHash', () => {
    it('should generate session request hash correctly', () => {
      const sessionOwner = '0x0987654321098765432109876543210987654321';
      const salt = generateSessionSalt(source, type);

      const sessionRequestHash = generateSessionRequestHash(
        sessionProvider,
        sessionOwner,
        salt,
        expiry
      );
      expect(sessionRequestHash).toBe(
        '0x71b84c91b09c4a7a463d2fef1243f7f98009db3d894e9d2695e3a182b1398eec'
      );
    });
  });

  describe('verifySessionRequest', () => {
    it('should verify session request correctly', async () => {
      const sessionPrivateKey =
        '0x0987654321098765432109876543210987654321098765432109876543210987';
      const signer = new Wallet(sessionPrivateKey);
      const sessionOwner = getAddress(signer.address);

      const salt = generateSessionSalt(source, type);

      const sessionRequestHash = generateSessionRequestHash(
        sessionProvider,
        sessionOwner,
        salt,
        expiry
      );

      const signature = await signer.signMessage(sessionRequestHash);

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
});
