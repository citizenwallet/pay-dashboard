import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { getServiceRoleClient } from '@/db';
import { checkUserPlaceAccess } from '@/db/places';
import { Separator } from '@radix-ui/react-separator';
import { Suspense } from 'react';
import PayoutDetailsPage from './details-page';
import { getPayoutAction } from './action';

export default async function PayoutOrderPage({
  params
}: {
  params: Promise<{ businessId: string; placeId: string; payout_id: string }>;
}) {
  const resolvedParams = await params;
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
            {AsyncPayoutOrderPage({
              payout_id: resolvedParams.payout_id,
              placeId: resolvedParams.placeId,
              businessId: resolvedParams.businessId
            })}
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

const AsyncPayoutOrderPage = async ({
  payout_id,
  placeId,
  businessId
}: {
  payout_id: string;
  placeId: string;
  businessId: string;
}) => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const admin = await isUserAdminAction();

  if (!admin) {
    const hasPlaceAccess = await checkUserPlaceAccess(
      client,
      userId,
      Number(placeId)
    );
    if (!hasPlaceAccess) {
      throw new Error('You do not have access to this place');
    }
  }
  const orders = await getPayoutAction(payout_id);

  return <PayoutDetailsPage payout_id={payout_id} orders={orders.data ?? []} />;
};
