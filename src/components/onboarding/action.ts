'use server';
import jwt from 'jsonwebtoken';
import { CompanyInfo } from './types';
import { getBusinessByToken, updateBusiness } from '@/db/business';
import { getServiceRoleClient } from '@/db';
import { getUserIdbyBusinessId } from '@/db/users';
import { createBusinessUser } from '@/db/businessUser';

interface JwtPayload {
  email: string;
  otp: string;
  exp: number;
  iat: number;
}

export async function jwtVerifyAction(
  token: string
): Promise<JwtPayload | null> {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined');
  }
  const decoded = jwt.verify(token, secretKey);
  return decoded as JwtPayload;
}

export async function businessOnboardAction(data: CompanyInfo) {
  const client = getServiceRoleClient();

  if (!data.token) {
    throw new Error('Token is required');
  }

  //get business by token
  const business = await getBusinessByToken(client, data.token as string);
  if (!business) {
    throw new Error('Business not found');
  }

  //remove id and token from data
  const { id, token, ...dataToUpdate } = data;

  //add status to data
  const updatedData = {
    ...dataToUpdate,
    status: 'Registered'
  };

  //update business
  const response = await updateBusiness(
    client,
    business.data?.id as number,
    updatedData
  );

  //get user id by business id
  const userId = await getUserIdbyBusinessId(
    client,
    business.data?.id as number
  );

  //create business user
  const businessUser = await createBusinessUser(
    client,
    userId,
    business.data?.id as number,
    'owner'
  );

  return response;
}
