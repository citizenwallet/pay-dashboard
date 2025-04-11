import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import PendingPayout from './pending-payout';
import { isUserAdminAction } from '@/actions/session';
import { getPendingPayoutsAction } from './action';
import Config from '@/cw/community.json';
import { CommunityConfig, getAccountBalance } from '@citizenwallet/sdk';
import { getTranslations } from 'next-intl/server';

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

  const payouts = await getPendingPayoutsAction(offset, limit, search);

  const payoutsWithBalance = await Promise.all(
    (payouts && 'error' in payouts ? [] : payouts?.data ?? []).map(
      async (payout: any) => {
        const balance = await getAccountBalance(community, payout.accounts[0]);
        return { ...payout, balance: Number(balance) };
      }
    )
  );

  return (
    <PendingPayout
      payouts={payoutsWithBalance}
      currencyLogo={currencyLogo}
      tokenDecimals={tokenDecimals}
      count={payouts?.count ?? 0}
      limit={Number(limit)}
      offset={Number(offset)}
    />
  );
}
