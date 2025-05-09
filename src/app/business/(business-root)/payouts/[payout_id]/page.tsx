import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { getPayoutAction, getPayoutStatusAction } from './action';
import Config from '@/cw/community.json';
import PayoutDetailsPage from './page-details';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { CommunityConfig } from '@citizenwallet/sdk';
import { getPayoutOrders } from '@/db/orders';
import { getServiceRoleClient } from '@/db';
import { getTranslations } from 'next-intl/server';
import { totalPayoutAmountAndCount, updatePayoutTotal } from '@/db/payouts';

export default async function PayoutOrderPage({
  params,
  searchParams
}: {
  params: Promise<{ payout_id: string }>;
  searchParams: Promise<{
    column?: string;
    order?: string;
    offset?: string;
    limit?: string;
  }>;
}) {
  const { payout_id } = await params;
  const { column, order, offset, limit } = await searchParams;
  const t = await getTranslations('rootpayouts');
  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={t('payoutDetails')}
              description={t('payoutDetailsDescription')}
            />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            {AsyncPayoutOrderPage(payout_id, column, order, offset, limit)}
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

const AsyncPayoutOrderPage = async (
  payout_id: string,
  column?: string,
  order?: string,
  offset?: string,
  limit?: string
) => {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to view this page</div>;
  }
  const orders = await getPayoutAction(
    payout_id,
    Number(limit ?? '25'),
    Number(offset ?? '0'),
    column ?? 'id',
    order
  );
  const client = getServiceRoleClient();

  const community = new CommunityConfig(Config);
  const { payout } = await getPayoutStatusAction(payout_id);
  if (!payout?.data) {
    return <div>Payout not found</div>;
  }

  const { totalAmount, totalFees, totalNet, count } =
    await totalPayoutAmountAndCount(client, payout_id);

  //check the total net is equal to the payout total
  if (totalAmount !== payout.data?.total || totalFees !== payout.data?.fees) {
    //then update the payout total
    await updatePayoutTotal(client, payout_id, totalAmount, totalFees);
  }

  return (
    <PayoutDetailsPage
      payout_id={payout_id}
      orders={orders.data ?? []}
      currencyLogo={community.community.logo}
      payout={payout.data}
      totalAmount={totalAmount ?? 0}
      totalFees={totalFees ?? 0}
      totalNet={totalNet ?? 0}
      count={Number(count ?? 0)}
      limit={limit}
      offset={offset}
    />
  );
};
