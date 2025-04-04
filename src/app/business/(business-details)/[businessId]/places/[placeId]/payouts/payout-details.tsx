'use client';

import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PayoutDetailsPage({
  payouts,
  placeId,
  businessId,
  currencyLogo
}: {
  payouts: Payout[];
  placeId: string;
  businessId: string;
  currencyLogo: string;
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
            accessorKey: 'burn',
            header: t('burn'),
            cell: ({ row }) => (
              <div className="flex items-center space-x-2">
                <span className="text-red-500">
                  {row.original.burn ? '🔥' : '-'}
                </span>
                <span>
                  {row.original.burnDate
                    ? new Date(row.original.burnDate).toLocaleDateString(
                        'en-GB'
                      )
                    : '-'}
                </span>
              </div>
            )
          },

          {
            accessorKey: 'transfer',
            header: t('transfer'),
            cell: ({ row }) => (
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">
                  {row.original.transfer ? '🏛️' : '-'}
                </span>
                <span>
                  {row.original.transferDate
                    ? new Date(row.original.transferDate).toLocaleDateString(
                        'en-GB'
                      )
                    : '-'}
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
