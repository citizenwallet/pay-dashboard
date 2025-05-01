'use client';

import CurrencyLogo from '@/components/currency-logo';
import SearchInput from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table-rowclick';
import { formatCurrencyNumber } from '@/lib/currency';
import { Column, PaginationState, Row } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface FullPayout {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  users: {
    email: string;
  };
  from: string;
  to: string;
  burn: number | null;
  transfer: number | null;
  total: number;
  place_id: number;
  business_id: number;
  places: {
    name: string;
  };
  businesses: {
    name: string;
  };
  payout_burn: {
    created_at: string | null;
  };
  payout_transfer: {
    created_at: string | null;
  };
}

export default function PayoutDetailsPage({
  payouts,
  currencyLogo,
  count,
  limit,
  offset
}: {
  payouts: FullPayout[];
  currencyLogo: string;
  count: number;
  limit: number;
  offset: number;
}) {
  const [payoutData, setPayoutData] = useState<FullPayout[]>(payouts);
  const router = useRouter();
  const t = useTranslations('rootpayouts');
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    setPayoutData(payouts);
  }, [payouts]);

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

  const handleSorting = (column: Column<FullPayout>, order: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('column', column.id);
    params.set('order', order);
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns = [
    {
      accessorKey: 'id',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              handleSorting(
                column,
                column.getIsSorted() === 'asc' ? 'asc' : 'desc'
              );
              column.toggleSorting(column.getIsSorted() === 'asc');
            }}
          >
            {t('id')}
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <Link
          href={`/business/payouts/${row.original.id}`}
          className="flex h-16 items-center"
        >
          {row.original.id}
        </Link>
      )
    },
    {
      accessorKey: 'business_id',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              handleSorting(
                column,
                column.getIsSorted() === 'asc' ? 'asc' : 'desc'
              );
              column.toggleSorting(column.getIsSorted() === 'asc');
            }}
          >
            {t('businessName')}
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <div className="flex h-16 items-center">
          {row.original.businesses.name}
        </div>
      )
    },
    {
      accessorKey: 'place_id',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              handleSorting(
                column,
                column.getIsSorted() === 'asc' ? 'asc' : 'desc'
              );
              column.toggleSorting(column.getIsSorted() === 'asc');
            }}
          >
            {t('placeName')}
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <div className="flex h-16 items-center">{row.original.places.name}</div>
      )
    },
    {
      accessorKey: 'created_at',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              handleSorting(
                column,
                column.getIsSorted() === 'asc' ? 'asc' : 'desc'
              );
              column.toggleSorting(column.getIsSorted() === 'asc');
            }}
          >
            {t('createdAt')}
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <div className="flex h-16 items-center">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : '-'}
        </div>
      )
    },
    {
      accessorKey: 'users',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return <div className="flex h-16 items-center">{t('by')}</div>;
      },
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <div className="flex h-16 items-center">
          {row.original.users?.email}
        </div>
      )
    },
    {
      accessorKey: 'from',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return <div className="flex h-16 items-center">{t('from')}</div>;
      },
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <div className="flex h-16 items-center">
          {row.original.from
            ? new Date(row.original.from).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : '-'}
        </div>
      )
    },
    {
      accessorKey: 'to',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return <div className="flex h-16 items-center">{t('to')}</div>;
      },
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <div className="flex h-16 items-center">
          {row.original.to
            ? new Date(row.original.to).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : '-'}
        </div>
      )
    },
    {
      accessorKey: 'total',
      header: ({ column }: { column: Column<FullPayout> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              handleSorting(
                column,
                column.getIsSorted() === 'asc' ? 'asc' : 'desc'
              );
              column.toggleSorting(column.getIsSorted() === 'asc');
            }}
          >
            {t('total')}
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<FullPayout> }) => {
        return (
          <p className="flex h-16 w-8 items-center gap-1">
            <CurrencyLogo logo={currencyLogo} size={18} />
            {formatCurrencyNumber(row.original.total)}
          </p>
        );
      }
    },
    {
      accessorKey: t('status'),
      cell: ({ row }: { row: Row<FullPayout> }) => (
        <div className="flex h-16 items-center space-x-2">
          {row.original.burn && row.original.transfer ? (
            <Badge className="bg-green-500"> {t('completed')}</Badge>
          ) : (
            <></>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href="/business/payouts/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            {t('newPayout')}
          </Button>
        </Link>

        <SearchInput className="w-80" />
      </div>

      <div className="w-[90vw] overflow-x-auto md:w-full">
        <DataTable
          columns={columns}
          data={payoutData}
          pageCount={Math.ceil(count / limit)}
          pageSize={limit}
          pageIndex={offset / limit}
          onPaginationChange={onPaginationChange}
          onRowClick={(row) =>
            router.push(`/business/payouts/${row.original.id}`)
          }
          rowClassName="cursor-pointer"
        />
      </div>
    </div>
  );
}
