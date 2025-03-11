'use server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  email: string;
  otp: string;
  exp: number;
  iat: number;
}

export async function jwtVerifyAction(
  token: string
): Promise<JwtPayload | null> {
  const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined');
  }
  const decoded = jwt.verify(token, secretKey);
  return decoded as JwtPayload;
}
