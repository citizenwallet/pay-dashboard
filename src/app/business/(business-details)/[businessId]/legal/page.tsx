import { auth } from '@/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import LegalPage from './legal';
import { checkUserAccessBusinessAction } from '../places/[placeId]/action';

export default async function page({
  params
}: {
  params: Promise<{ businessId: string }>;
}) {
  const resolvedParams = await params;
  return (
    <>
      <Suspense fallback={<Skeleton className="h-full w-full rounded-xl" />}>
        <AsyncPageLoader businessId={Number(resolvedParams.businessId)} />
      </Suspense>
    </>
  );
}

const AsyncPageLoader = async ({ businessId }: { businessId: number }) => {
  const session = await auth();
  if (!session?.user) {
    return redirect('/login');
  }

  const hasAccess = await checkUserAccessBusinessAction(Number(businessId));

  if (!hasAccess) {
    return redirect('/');
  }

  return <LegalPage businessId={businessId} />;
};
