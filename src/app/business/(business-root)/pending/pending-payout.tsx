'use client';
import CurrencyLogo from '@/components/currency-logo';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrencyNumber } from '@/lib/currency';
import { PaginationState, Row } from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchInput from '@/components/search-input';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface UpdatePayout {
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
  businesses: { name: string };
  payouts: { created_at: string; id: string }[];
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
  payouts: UpdatePayout[];
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
      accessorKey: 'businesses.name'
    },
    {
      header: t('placeName'),
      accessorKey: 'name'
    },
    {
      header: t('balance'),
      accessorKey: 'balance',
      cell: ({ row }: { row: Row<UpdatePayout> }) => (
        <p className="flex items-center gap-2 text-sm font-medium min-w-20">
          <CurrencyLogo logo={currencyLogo} size={18} />
          {formatCurrencyNumber(row.original.balance, tokenDecimals)}
        </p>
      )
    },
    {
      header: t('lastPayout'),
      cell: ({ row }: { row: Row<UpdatePayout> }) => {
        const payouts = row.original.payouts;
        const lastPayout = payouts?.[payouts.length - 1];

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
      cell: ({ row }: { row: Row<UpdatePayout> }) => (
        <Button
          variant="outline"
          size="sm"
          className="min-w-20"
          onClick={() => {
            const lastPayout =
              row.original.payouts[row.original.payouts.length - 1];
            if (lastPayout) {
              router.push(
                `/business/payouts/new?placeId=${row.original.id}&lastPayoutId=${lastPayout.id}`
              );
            } else {
              router.push(`/business/payouts/new?placeId=${row.original.id}`);
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
      <div className="flex items-center justify-end">
        <SearchInput className="w-80" />
      </div>

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
