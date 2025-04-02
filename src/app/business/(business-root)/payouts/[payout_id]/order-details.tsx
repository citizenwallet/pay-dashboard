'use client';
import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { Order } from '@/db/orders';
import { formatCurrencyNumber } from '@/lib/currency';
import { Column, ColumnDef, PaginationState } from '@tanstack/react-table';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function OrderViewTable({
  orders,
  currencyLogo,
  count,
  limit,
  offset
}: {
  orders: Order[];
  currencyLogo: string;
  count: number;
  limit: string;
  offset: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSorting = (column: Column<Order>, order: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('column', column.id);
    params.set('order', order);
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: ({ column }: { column: Column<Order> }) => {
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
            ID
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      }
    },
    {
      accessorKey: 'created_at',
      header: ({ column }: { column: Column<Order> }) => {
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
            Date
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString(
          'en-GB',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        )}`;
      }
    },
    {
      accessorKey: 'total',
      header: ({ column }: { column: Column<Order> }) => {
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
            Total
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <p className="flex w-8 items-center gap-1">
            <CurrencyLogo logo={currencyLogo} size={18} />
            {formatCurrencyNumber(row.original.total)}
          </p>
        );
      }
    }
  ];

  const onPaginationChange = useCallback(
    (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      const newState =
        typeof updaterOrValue === 'function'
          ? updaterOrValue({
              pageIndex: Number(offset) / Number(limit),
              pageSize: Number(limit)
            })
          : updaterOrValue;

      const params = new URLSearchParams(searchParams);
      params.set('offset', (newState.pageIndex * newState.pageSize).toString());
      params.set('limit', newState.pageSize.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, offset, limit]
  );

  return (
    <div>
      <DataTable
        columns={columns}
        data={orders}
        pageCount={Math.ceil(count / Number(limit))}
        pageSize={Number(limit)}
        pageIndex={Number(offset) / Number(limit)}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
}
