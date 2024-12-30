'use client';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TransactionTableAction from '@/app/dashboard/overview/_components/transaction-tables/transaction-table-action';
import React, { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import TransactionListingPage from '@/app/dashboard/overview/_components/transaction-listing';
import { useTranslations } from 'next-intl';


type Props = {
  key: string;
}

export const OverviewPage: React.FC<Props> = ({key}) => {

  const t = useTranslations();

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Transactions"
            description="Show transactions infos"
          />
          <Link
            target={"_blank"}
            href="/api/transactions?export=true"
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Link>
        </div>
        <Separator />
        {/*<TransactionTableAction />*/}
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <TransactionListingPage />
        </Suspense>
      </div>
    </PageContainer>
  )
}
