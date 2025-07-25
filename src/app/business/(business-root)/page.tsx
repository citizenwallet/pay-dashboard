import { auth } from '@/auth';
import { DataTable } from '@/components/ui/data-table';
import { getServiceRoleClient } from '@/db';
import { getBusinessesBySearch } from '@/db/business';
import { isAdmin } from '@/db/users';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import BusinessTable from './_table/business-table';
import { placeholderData, skeletonColumns } from './_table/columns';

interface BusinessPageProps {
  searchParams: Promise<{
    offset?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function Page({ searchParams }: BusinessPageProps) {
  const { offset, limit, search } = await searchParams;

  return (
    <>
      <Suspense
        fallback={
          <DataTable columns={skeletonColumns} data={placeholderData} />
        }
      >
        {asyncBusinessPage(offset ?? '0', limit ?? '15', search ?? '')}
      </Suspense>
    </>
  );
}

const asyncBusinessPage = async (
  offset: string,
  limit: string,
  search: string
) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const client = getServiceRoleClient();
  const admin = await isAdmin(client, parseInt(session.user.id));

  const { data: businesses, count } = await getBusinessesBySearch(
    client,
    Number(limit),
    Number(offset),
    search,
    !admin ? parseInt(session.user.id) : null
  );

  return (
    <BusinessTable
      businesses={businesses ?? []}
      count={count ?? 0}
      offset={Number(offset)}
      limit={Number(limit)}
    />
  );
};
