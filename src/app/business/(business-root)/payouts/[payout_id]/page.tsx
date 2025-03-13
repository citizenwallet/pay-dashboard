import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { checkPayoutBurnOrTransferAction, getPayoutAction } from './action';

import PayoutDetailsPage from './page-details';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export default async function PayoutOrderPage({
  params
}: {
  params: { payout_id: string };
}) {
  const { payout_id } = await params;
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
            {AsyncPayoutOrderPage({ payout_id })}
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

const AsyncPayoutOrderPage = async ({ payout_id }: { payout_id: string }) => {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to view this page</div>;
  }
  const orders = await getPayoutAction(payout_id);

  const isBurnOrTransfer = await checkPayoutBurnOrTransferAction(payout_id);

  return (
    <PayoutDetailsPage
      payout_id={payout_id}
      orders={orders.data ?? []}
      isBurnOrTransfer={isBurnOrTransfer}
    />
  );
};
