import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import Config from '@/cw/community.json';
import { getServiceRoleClient } from '@/db';
import { CommunityConfig } from '@citizenwallet/sdk';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PendingPayout from './pending-payout';
import { getAllBalancesForToken } from '@/db/placeBalance';

interface PendingPayoutsPageProps {
  searchParams: Promise<{
    offset?: string;
    limit?: string;
  }>;
}

export default async function Page({ searchParams }: PendingPayoutsPageProps) {
  const { offset, limit } = await searchParams;
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
            <AsyncPayoutsLoader offset={offset ?? '0'} limit={limit ?? '15'} />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPayoutsLoader({
  offset,
  limit
}: {
  offset: string;
  limit: string;
}) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to access pending payouts</div>;
  }

  const community = new CommunityConfig(Config);
  const currencyLogo = community.community.logo;
  const tokenDecimals = community.primaryToken.decimals;

  const client = getServiceRoleClient();
  const { data, count } = await getAllBalancesForToken(
    client,
    community.primaryToken.address,
    Number(offset),
    Number(limit)
  );

  return (
    <PendingPayout
      payouts={data}
      currencyLogo={currencyLogo}
      tokenDecimals={tokenDecimals}
      count={count}
      limit={Number(limit)}
      offset={Number(offset)}
    />
  );
}
