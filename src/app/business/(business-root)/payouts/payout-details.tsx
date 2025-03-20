'use client';

import CurrencyLogo from '@/components/currency-logo';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function PayoutDetailsPage({
  payouts,
  currencyLogo
}: {
  payouts: Payout[];
  currencyLogo: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/business/payouts/new">
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          New Payout
        </Button>
      </Link>

      <DataTable
        columns={[
          {
            accessorKey: 'id',
            header: 'Id',
            cell: ({ row }) => (
              <Link href={`/business/payouts/${row.original.id}`}>
                {row.original.id}
              </Link>
            )
          },
          { accessorKey: 'business_id', header: 'Business Name' },
          { accessorKey: 'place_id', header: 'Place Name' },
          {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: ({ row }) =>
              new Date(row.original.created_at).toLocaleString().split(',')[0]
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
    </div>
  );
}
