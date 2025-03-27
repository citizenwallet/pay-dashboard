import { auth, signIn } from '@/auth';
import VatPage from './vat-page';
import { redirect } from 'next/navigation';
import { getServiceRoleClient } from '@/db';
import { getBusinessByToken } from '@/db/business';
import Image from 'next/image';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import jwt from 'jsonwebtoken';

export default async function VatMainPage({
  searchParams
}: {
  searchParams: Promise<{ invite_code?: string; otpToken?: string }>;
}) {
  const otpToken = (await searchParams)?.otpToken;
  const inviteCode = (await searchParams)?.invite_code;
  const client = getServiceRoleClient();
  let decoded: { email: string; otp: string; iat: number; exp: number } | null =
    null;
  if (!inviteCode) {
    return redirect('/onboarding');
  }

  if (otpToken) {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined');
    }
    try {
      decoded = (await jwt.verify(otpToken, secretKey)) as {
        email: string;
        otp: string;
        iat: number;
        exp: number;
      };
    } catch (error) {
      console.log(error);
      return redirect('/onboarding');
    }
  } else {
    const session = await auth();
    if (!session?.user) {
      return redirect('/onboarding');
    }
  }

  const business = await getBusinessByToken(client, inviteCode);

  if (!business.data) {
    return redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4338ca]">
            <Image
              src="/assets/img/logo.svg"
              alt="Logo"
              width={64}
              height={64}
            />
          </div>

          <h1 className="text-center text-2xl font-semibold text-gray-900">
            Welcome to Brussels.pay!
          </h1>
        </div>

        <Suspense fallback={<Skeleton className="h-4 w-[250px]" />}>
          <VatPage business={business.data} decoded={decoded} />
        </Suspense>
      </div>
    </div>
  );
}
