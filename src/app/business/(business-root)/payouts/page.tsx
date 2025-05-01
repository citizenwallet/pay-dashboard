import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import Config from '@/cw/community.json';
import { getServiceRoleClient } from '@/db';
import { CommunityConfig } from '@citizenwallet/sdk';
import { Suspense } from 'react';
import { getAllPayoutAction } from './action';
import PayoutDetailsPage from './payout-details';
import { getTranslations } from 'next-intl/server';

interface PayoutsPageProps {
  searchParams: Promise<{
    offset?: string;
    limit?: string;
    search?: string;
    column?: string;
    order?: string;
  }>;
}

export default async function PayoutsPage({ searchParams }: PayoutsPageProps) {
  const { search, offset, limit, column, order } = await searchParams;
  const t = await getTranslations('rootpayouts');
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading title={t('payouts')} description={t('payoutsDescription')} />
        </div>
        <Separator />
        <Suspense
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <AsyncPayoutsLoader
            search={search}
            offset={offset ?? '0'}
            limit={limit ?? '10'}
            column={column}
            order={order}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function AsyncPayoutsLoader({
  search,
  offset,
  limit,
  column,
  order
}: {
  search?: string;
  offset: string;
  limit: string;
  column?: string;
  order?: string;
}) {
  const client = getServiceRoleClient();

  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to view this page</div>;
  }
  const payouts = await getAllPayoutAction(
    Number(limit),
    Number(offset),
    search,
    column,
    order
  );

  const { count, error } = await client
    .from('payouts')
    .select('*', { count: 'exact' });
  const community = new CommunityConfig(Config);

  return (
    <PayoutDetailsPage
      payouts={payouts}
      currencyLogo={community.community.logo}
      count={count ?? 0}
      limit={Number(limit)}
      offset={Number(offset)}
    />
  );
}
