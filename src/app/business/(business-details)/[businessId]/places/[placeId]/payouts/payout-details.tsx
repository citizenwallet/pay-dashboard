'use client';

import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
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
  return (
    <>
      <DataTable
        columns={[
          {
            accessorKey: 'id',
            header: 'Id',
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
            header: 'From',
            cell: ({ row }) =>
              new Date(row.original.from).toLocaleDateString('en-GB')
          },
          {
            accessorKey: 'to',
            header: 'To',
            cell: ({ row }) =>
              new Date(row.original.to).toLocaleDateString('en-GB')
          },
          {
            accessorKey: 'total',
            header: 'Total',
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
            header: 'Burn',
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
            header: 'Transfer',
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
