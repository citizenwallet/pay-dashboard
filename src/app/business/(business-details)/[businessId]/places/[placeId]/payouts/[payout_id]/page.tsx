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
import { CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { getTranslations } from 'next-intl/server';
import { updatePayoutTotal } from '@/db/payouts';
import { totalPayoutAmountAndCount } from '@/db/payouts';
import { getPayoutStatusAction } from '@/app/business/(business-root)/payouts/[payout_id]/action';

export default async function PayoutOrderPage({
  params
}: {
  params: Promise<{ businessId: string; placeId: string; payout_id: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations('payouts');
  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={t('payoutDetails')}
              description={t('payoutDetailsdescription')}
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
  const community = new CommunityConfig(Config);
  const currencyLogo = community.community.logo;

  const { payout } = await getPayoutStatusAction(payout_id);
  if (!payout?.data) {
    return <div>Payout not found</div>;
  }

  const { totalAmount, totalFees } = await totalPayoutAmountAndCount(
    client,
    payout_id
  );

  //check the total net is equal to the payout total
  if (totalAmount !== payout.data?.total || totalFees !== payout.data?.fees) {
    //then update the payout total
    await updatePayoutTotal(client, payout_id, totalAmount, totalFees);
  }

  return (
    <PayoutDetailsPage
      payout_id={payout_id}
      orders={orders.data ?? []}
      currencyLogo={currencyLogo}
    />
  );
};
