'use client';
import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { Order } from '@/db/orders';
import { formatCurrencyNumber } from '@/lib/currency';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'ID'
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
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
      header: 'Total',
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
