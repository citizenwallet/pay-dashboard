'use client';
import CurrencyLogo from '@/components/currency-logo';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrencyNumber } from '@/lib/currency';
import { Row } from '@tanstack/react-table';

export default function PendingPayout({
  payouts,
  currencyLogo,
  tokenDecimals
}: {
  payouts: any[];
  currencyLogo: string;
  tokenDecimals: number;
}) {
  const columns = [
    {
      header: 'Business Name',
      accessorKey: 'businesses.name'
    },
    {
      header: 'Place Name',
      accessorKey: 'name'
    },
    {
      header: 'Balance',
      accessorKey: 'balance',
      cell: ({ row }: { row: Row<any> }) => (
        <p className="flex items-center gap-2 text-sm font-medium">
          <CurrencyLogo logo={currencyLogo} size={18} />
          {formatCurrencyNumber(row.original.balance, tokenDecimals)}
        </p>
      )
    },
    {
      header: 'Last Payout',
      cell: ({ row }: { row: Row<any> }) => {
        const payouts = row.original.payouts;
        const lastPayout = payouts?.[payouts.length - 1];

        return (
          <>
            {lastPayout
              ? new Date(lastPayout.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : '—'}
          </>
        );
      }
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: Row<any> }) => (
        <Button variant="outline" size="sm">
          Payout
        </Button>
      )
    }
  ];
  return (
    <div className="w-[90vw] overflow-x-auto md:w-full">
      <DataTable columns={columns} data={payouts} />
    </div>
  );
}
