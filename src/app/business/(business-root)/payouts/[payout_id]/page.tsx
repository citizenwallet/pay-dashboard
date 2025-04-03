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
import { getTranslations } from 'next-intl/server';

export default async function PayoutOrderPage({
  params
}: {
  params: Promise<{ payout_id: string }>;
}) {
  const { payout_id } = await params;
  const t = await getTranslations('rootpayouts');

  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={t('payoutdetails')}
              description={t('payoutdetailsdescription')}
            />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            {AsyncPayoutOrderPage(payout_id, t)}
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

const AsyncPayoutOrderPage = async (
  payout_id: string,
  t: Awaited<ReturnType<typeof getTranslations>>
) => {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>{t('youarenotauthorized')}</div>;
  }
  const orders = await getPayoutAction(payout_id);
  const community = new CommunityConfig(Config);
  const { payout } = await getPayoutStatusAction(payout_id);
  if (!payout?.data) {
    return <div>{t('payoutnotfound')}</div>;
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
