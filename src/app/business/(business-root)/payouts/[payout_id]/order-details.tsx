'use client';
import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { Order } from '@/db/orders';
import { formatCurrencyNumber } from '@/lib/currency';
import { Column, ColumnDef, PaginationState } from '@tanstack/react-table';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { SmartphoneIcon } from 'lucide-react';
import { QrCodeIcon } from 'lucide-react';
import { SmartphoneNfcIcon } from 'lucide-react';
import { formatAddress } from '@/lib/address';

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
  const t = useTranslations('rootpayouts');

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
            {t('id')}
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
            {t('date')}
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
            {t('total')}
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
            {formatCurrencyNumber(row.original.total - row.original.fees)}
          </p>
        );
      }
    },
    {
      accessorKey: 'status',
      header: ({ column }: { column: Column<Order> }) => {
        return <div>{t('status')}</div>;
      },
      cell: ({ row }) => {
        if (row.original.status === 'needs_minting') {
          return (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-yellow-300 px-2 py-1 text-yellow-800">
                {t('needsMinting')}
              </div>
            </div>
          );
        }

        if (row.original.status === 'paid') {
          return (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-300 px-2 py-1 text-green-800">
                {t('paid')}
              </div>
            </div>
          );
        }
        return <div>{t(row.original.status)}</div>;
      }
    },
    {
      accessorKey: 'source',
      header: ({ column }: { column: Column<Order> }) => {
        return <div>{t('source')}</div>;
      },
      cell: ({ row }) => {
        const isTerminal = row.original.type === 'terminal' && row.original.pos;
        if (isTerminal) {
          return (
            <div className="flex items-center">
              <span className="flex gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                <SmartphoneNfcIcon className="h-4 w-4" />
                {`${t('terminal')}: ${
                  row.original.pos?.startsWith('0x')
                    ? formatAddress(row.original.pos)
                    : row.original.pos
                }`}
              </span>
            </div>
          );
        }

        if (row.original.type === 'web' || !row.original.type) {
          return (
            <div className="flex items-center">
              <span className="flex gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                <QrCodeIcon className="h-4 w-4" />
                {t('qr')}
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center">
            <span className="flex gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
              <SmartphoneIcon className="h-4 w-4" />
              {`${t('app')}`}
            </span>
          </div>
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
