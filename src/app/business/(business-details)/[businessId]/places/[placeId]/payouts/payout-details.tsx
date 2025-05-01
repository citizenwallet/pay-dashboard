'use client';

import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { PayoutWithBurnAndTransfer } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PayoutDetailsPage({
  payouts,
  placeId,
  businessId,
  currencyLogo,
  balance
}: {
  payouts: PayoutWithBurnAndTransfer[];
  placeId: string;
  businessId: string;
  currencyLogo: string;
  balance: string;
}) {
  const t = useTranslations('payouts');
  return (
    <>
      <DataTable
        columns={[
          {
            accessorKey: 'id',
            header: t('id'),
            cell: ({ row }) => (
              <Link
                href={`/business/${businessId}/places/${placeId}/payouts/${row.original.id}`}
              >
                {row.original.id}
              </Link>
            )
          },
          {
            accessorKey: 'from',
            header: t('from'),
            cell: ({ row }) =>
              new Date(row.original.from).toLocaleDateString('en-GB')
          },
          {
            accessorKey: 'to',
            header: t('to'),
            cell: ({ row }) =>
              new Date(row.original.to).toLocaleDateString('en-GB')
          },
          {
            accessorKey: 'total',
            header: t('total'),
            cell: ({ row }) => {
              return (
                <p className="flex w-8 items-center gap-1">
                  <CurrencyLogo logo={currencyLogo} size={18} />
                  {formatCurrencyNumber(row.original.total)}
                </p>
              );
            }
          },

          {
            accessorKey: 'completed',
            header: t('completed'),
            cell: ({ row }) => (
              <div className="flex items-center space-x-2">
                <span>
                  {row.original.payout_burn?.created_at &&
                    row.original.payout_transfer?.created_at &&
                    '✅'}
                </span>
              </div>
            )
          }
        ]}
        data={payouts}
      />
    </>
  );
}
