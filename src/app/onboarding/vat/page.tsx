import { auth } from '@/auth';
import VatPage from './vat-page';
import { redirect } from 'next/navigation';
import { getServiceRoleClient } from '@/db';
import { getBusinessByToken } from '@/db/business';
import Image from 'next/image';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function VatMainPage({
  searchParams
}: {
  searchParams: Promise<{ invite_code?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return redirect('/onboarding');
  }

  const inviteCode = (await searchParams)?.invite_code;
  if (!inviteCode) {
    return redirect('/onboarding');
  }

  const client = getServiceRoleClient();
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
          <VatPage business={business.data} />
        </Suspense>
      </div>
    </div>
  );
}
