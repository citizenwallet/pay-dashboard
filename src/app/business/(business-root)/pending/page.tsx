import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import Config from '@/cw/community.json';
import { getServiceRoleClient } from '@/db';
import { getPayoutsByPlaceId } from '@/db/payouts';
import { getAllPlacesWithBusiness, PlaceWithBusiness } from '@/db/places';
import { CommunityConfig, getAccountBalance } from '@citizenwallet/sdk';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PendingPayout, { UpdatePayout } from './pending-payout';

interface PendingPayoutsPageProps {
  searchParams: Promise<{
    offset?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function Page({ searchParams }: PendingPayoutsPageProps) {
  const { offset, limit, search } = await searchParams;
  const t = await getTranslations('pendingpayout');
  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={t('pendingPayout')}
              description={t('pendingPayoutDescription')}
            />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            <AsyncPayoutsLoader
              offset={offset ?? '0'}
              limit={limit ?? '15'}
              search={search ? search : ''}
            />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPayoutsLoader({
  offset,
  limit,
  search
}: {
  offset: string;
  limit: string;
  search: string;
}) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return null;
  }

  const community = new CommunityConfig(Config);
  const currencyLogo = community.community.logo;
  const tokenDecimals = community.primaryToken.decimals;

  const client = getServiceRoleClient();
  let allplaces: PlaceWithBusiness[] = [];
  const { data: allplacesData } = await getAllPlacesWithBusiness(client);

  if (allplacesData) {
    allplaces = allplacesData;
  }

  if (search) {
    allplaces = allplaces?.filter((place) => place.name.toLowerCase().includes(search.toLowerCase()) || place.business?.name.toLowerCase().includes(search.toLowerCase()));
  }


  const allplacesWithBalance = await Promise.all(
    allplaces?.map(async (place) => {
      try {
        const balance = await getAccountBalance(community, place.accounts[0]);
        return { ...place, balance: Number(balance) };
      } catch (error) {
        console.error(error);
        return { ...place, balance: 0 };
      }

    }) ?? []
  );

  const sortedAllplacesWithBalance = allplacesWithBalance.sort((a, b) => b.balance - a.balance);
  const allplacesWithBalanceSlice = sortedAllplacesWithBalance.slice(Number(offset), Number(offset) + Number(limit) - 1);


  const allplacesWithBalanceSliceWithPayouts = await Promise.all(
    allplacesWithBalanceSlice.map(async (place) => {
      const { data: payouts } = await getPayoutsByPlaceId(client, place.id.toString());
      return { ...place, payouts: payouts ?? [] };
    })
  ) as UpdatePayout[];


  return (
    <PendingPayout
      payouts={allplacesWithBalanceSliceWithPayouts}
      currencyLogo={currencyLogo}
      tokenDecimals={tokenDecimals}
      count={allplaces?.length ?? 0}
      limit={Number(limit)}
      offset={Number(offset)}
    />
  );
}
