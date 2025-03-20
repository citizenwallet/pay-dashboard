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

type PayoutOrderPageProps = {
  params: { payout_id: string };
};

export default async function PayoutOrderPage({
  params
}: {
  params: Promise<PayoutOrderPageProps>;
}) {
  const payout_id = await params;
  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title="Payout Details"
              description="Payout details and the orders "
            />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            {AsyncPayoutOrderPage(payout_id.params.payout_id)}
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

const AsyncPayoutOrderPage = async (payout_id: string) => {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to view this page</div>;
  }
  const orders = await getPayoutAction(payout_id);

  const community = new CommunityConfig(Config);
  const payout = await getPayoutStatusAction(payout_id);
  if (!payout.data) {
    return <div>Payout not found</div>;
  }

  return (
    <PayoutDetailsPage
      payout_id={payout_id}
      orders={orders.data ?? []}
      currencyLogo={community.community.logo}
      payout={payout.data}
    />
  );
};
