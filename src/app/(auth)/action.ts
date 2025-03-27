'use server';

import { signIn } from '@/auth';
import { getServiceRoleClient } from '@/db';
import { getBusinessById } from '@/db/business';
import { createOtp } from '@/db/otp';
import { getUserByEmail, userExists } from '@/db/users';
import { sendOtpEmail } from '@/services/brevo';
import { generateOtp } from '@/utils/generateotp';
import { fi } from 'date-fns/locale';

export async function checkIsUseraction(email: string): Promise<boolean> {
  const client = getServiceRoleClient();
  const data = await userExists(client, email);
  return data;
}

export async function sendOtpAction(email: string) {
  try {
    const client = getServiceRoleClient();
    const otp = await generateOtp(6);
    await sendOtpEmail(email, otp);
    await createOtp(client, email, otp.toString());
    return true;
  } catch (error) {
    return error;
  }
}

export async function signAction(email: string, otp: string) {
  try {
    await signIn('credentials', {
      email,
      code: otp
    });
  } catch (error) {
    return error;
  } finally {
    return true;
  }
}

export async function getUserByEmailAction(email: string) {
  const client = getServiceRoleClient();
  const user = await getUserByEmail(client, email);
  return user;
}

export async function getBusinessByIdAction(id: number) {
  const client = getServiceRoleClient();
  const business = await getBusinessById(client, id);
  return business;
}
