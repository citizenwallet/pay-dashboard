import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import React, { Suspense } from 'react';
import PayoutDetailsPage from './payout-details';
import { getAllPayoutAction } from './action';

export default function PayoutsPage() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Payouts" description="Payouts of the business" />
        </div>
        <Separator />
        <Suspense
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          {AsyncPayoutsLoader()}
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function AsyncPayoutsLoader() {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to view this page</div>;
  }
  const payouts = await getAllPayoutAction();
  console.log(payouts);
  return <PayoutDetailsPage payouts={payouts} />;
}
