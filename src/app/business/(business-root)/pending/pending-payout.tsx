'use client';
import CurrencyLogo from '@/components/currency-logo';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { PayoutWithBurnAndTransfer } from '@/db/payouts';
import { BalanceWithPlace } from '@/db/placeBalance';
import { PaginationState, Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export interface UpdatePayout {
  id: number;
  created_at: string;
  name: string;
  business_id: number;
  slug: string;
  accounts: string[];
  invite_code: string | null;
  terminal_id: string | null;
  image: string;
  description: string;
  display: string;
  hidden: boolean;
  archived: boolean;
  business: { name: string };
  payouts: PayoutWithBurnAndTransfer[];
  balance: number;
}

export default function PendingPayout({
  payouts,
  currencyLogo,
  tokenDecimals,
  count,
  limit,
  offset
}: {
  payouts: BalanceWithPlace[];
  currencyLogo: string;
  tokenDecimals: number;
  count: number;
  limit: number;
  offset: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('pendingpayout');

  const onPaginationChange = useCallback(
    (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      const newState =
        typeof updaterOrValue === 'function'
          ? updaterOrValue({
              pageIndex: offset / limit,
              pageSize: limit
            })
          : updaterOrValue;

      const params = new URLSearchParams(searchParams);
      params.set('offset', (newState.pageIndex * newState.pageSize).toString());
      params.set('limit', newState.pageSize.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, offset, limit]
  );

  const columns = [
    {
      header: t('businessName'),
      accessorKey: 'place.business.name'
    },
    {
      header: t('placeName'),
      accessorKey: 'place.name'
    },
    {
      header: t('balance'),
      accessorKey: 'balance',
      cell: ({ row }: { row: Row<BalanceWithPlace> }) => (
        <p className="flex min-w-20 items-center gap-2 text-sm font-medium">
          <CurrencyLogo logo={currencyLogo} size={18} />
          {(row.original.balance / 100).toFixed(2)}
        </p>
      )
    },
    {
      header: t('lastPayout'),
      cell: ({ row }: { row: Row<BalanceWithPlace> }) => {
        const payouts = row.original.place.payouts;
        const lastPayout = payouts[payouts.length - 1];

        return (
          <div className="min-w-20">
            {lastPayout
              ? new Date(lastPayout.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : '—'}
          </div>
        );
      }
    },
    {
      header: t('action'),
      cell: ({ row }: { row: Row<BalanceWithPlace> }) => (
        <Button
          variant="outline"
          size="sm"
          className="min-w-20"
          onClick={() => {
            const lastPayout = row.original.place.payouts[0];
            if (lastPayout) {
              router.push(
                `/business/payouts/new?placeId=${row.original.place_id}&lastPayoutId=${lastPayout.id}`
              );
            } else {
              router.push(
                `/business/payouts/new?placeId=${row.original.place_id}`
              );
            }
          }}
        >
          {t('payout')}
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-[90vw] overflow-x-auto md:w-full">
        <DataTable
          columns={columns}
          data={payouts}
          pageCount={Math.ceil(count / limit)}
          pageSize={limit}
          pageIndex={offset / limit}
          onPaginationChange={onPaginationChange}
        />
      </div>
    </div>
  );
}
