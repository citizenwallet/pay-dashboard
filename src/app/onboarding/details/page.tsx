import Image from 'next/image';
import DetailsPage from './details-page';
import { redirect } from 'next/navigation';
import { fetchCompanyForVatNumber } from '@/services/vat';
import { auth } from '@/auth';
import { getServiceRoleClient } from '@/db';
import { getBusinessByVatNumber } from '@/db/business';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

export default async function CompanyDetailsPage({
  searchParams
}: {
  searchParams: Promise<{ vat?: string }>;
}) {
  const vat = (await searchParams)?.vat;
  if (!vat) {
    return redirect('/onboarding');
  }
  const t = await getTranslations('onboardingDetails');

  return (
    <>
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

            <h1 className="text-left text-2xl font-semibold text-gray-900">
              {t('description')}
            </h1>
          </div>

          <Suspense fallback={<Skeleton className="h-4 w-[250px]" />}>
            {asyncDetailLoader(vat)}
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function asyncDetailLoader(vat: string) {
  const session = await auth();
  if (!session?.user) {
    return redirect('/onboarding');
  }

  const client = getServiceRoleClient();
  const business = await getBusinessByVatNumber(client, vat);

  if (!business.data) {
    return redirect('/onboarding');
  }

  const company = await fetchCompanyForVatNumber(vat);
  let companyData = null;
  if (company?.isValid) {
    companyData = company;
  }

  return <DetailsPage company={companyData} business={business.data} />;
}
