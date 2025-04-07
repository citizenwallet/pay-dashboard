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

export default function page() {
  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title="Pending Payouts"
              description="Available to be paid out"
            />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            <AsyncPayoutsLoader />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPayoutsLoader() {
  const admin = await isUserAdminAction();
  if (!admin) {
    return null;
  }

  const community = new CommunityConfig(Config);
  const currencyLogo = community.community.logo;
  const tokenDecimals = community.primaryToken.decimals;

  const payouts = await getPendingPayoutsAction();

  const payoutsWithBalance = await Promise.all(
    ('error' in payouts ? [] : payouts).map(async (payout: any) => {
      const balance = await getAccountBalance(community, payout.accounts[0]);
      return { ...payout, balance: Number(balance) };
    })
  );

  console.log(payoutsWithBalance);

  return (
    <PendingPayout
      payouts={payoutsWithBalance}
      currencyLogo={currencyLogo}
      tokenDecimals={tokenDecimals}
    />
  );
}
