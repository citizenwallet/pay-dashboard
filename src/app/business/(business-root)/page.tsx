import { auth } from '@/auth';
import { DataTable } from '@/components/ui/data-table';
import Config from '@/cw/community.json';
import { getServiceRoleClient } from '@/db';
import { Business, getBusinessById, getBusinessesBySearch, getLinkedBusinessByUserId } from '@/db/business';
import { isAdmin } from '@/db/users';
import { CommunityConfig } from '@citizenwallet/sdk';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import BusinessTable from './_table/business-table';
import { placeholderData, skeletonColumns } from './_table/columns';
import { getBusinessBalanceAction } from './action';


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

      <Suspense fallback={<DataTable columns={skeletonColumns} data={placeholderData} />}>
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

  let businessesWithBalance: (Business & { balance: number })[] | null = null;
  const community = new CommunityConfig(Config);
  let count = 0;

  if (admin) {

    const businesses = await getBusinessesBySearch(
      client,
      Number(limit),
      Number(offset),
      search
    );


    businessesWithBalance = await Promise.all(
      businesses.data?.map(async (business) => {
        const balance = await getBusinessBalanceAction(business.id, community);
        return { ...business, balance };
      }) ?? []
    );

    count = businesses.count ?? 0;

  } else {
    const businessid = await getLinkedBusinessByUserId(
      client,
      parseInt(session.user.id)
    );

    if (!businessid.data?.linked_business_id) {
      return null;
    }
    const business = await getBusinessById(
      client,
      businessid.data.linked_business_id
    );
    if (!business.data) {
      return null;
    }
    const balance = await getBusinessBalanceAction(business.data.id, community);
    businessesWithBalance = [{ ...business.data, balance }];

  }


  return <BusinessTable
    businesses={businessesWithBalance ?? []}
    count={count}
    offset={Number(offset)}
    limit={Number(limit)}
  />;
};

