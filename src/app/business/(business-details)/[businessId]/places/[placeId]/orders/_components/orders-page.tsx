'use client';

import CurrencyLogo from '@/components/currency-logo';
import PageContainer from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/db/orders';
import { Place } from '@/db/places';
import { formatCurrencyNumber } from '@/lib/currency';
import { cn, humanizeDate } from '@/lib/utils';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { exportCsvAction, postRefundAction } from '../action';
import {
  Loader2,
  QrCodeIcon,
  SmartphoneIcon,
  SmartphoneNfcIcon
} from 'lucide-react';
import { formatAddress } from '@/lib/address';
import { DatePicker } from '@/components/ui/DatePicker';
import { AlertModal } from '@/components/modal/alert-modal';

interface Props {
  place: Place;
  orders: Order[];
  currencyLogo: string;
  pagination: {
    limit: number;
    offset: number;
    totalItems: number;
  };
  total: string;
}

const createColumns = (
  currencyLogo: string,
  t: (key: string) => string,
  onRefundClick: (orderId: number) => void
): ColumnDef<Order>[] => [
  {
    accessorKey: 'id',
    header: t('id'),
    cell: ({ row }) => {
      return row.original.id;
    }
  },
  {
    accessorKey: 'date',
    header: t('date'),
    cell: ({ row }) => {
      return humanizeDate(row.original.created_at);
    }
  },
  {
    accessorKey: 'total',
    header: t('total'),
    cell: ({ row }) => {
      return (
        <p
          className={cn('flex w-8 items-center gap-1', {
            'line-through': row.original.status === 'refunded'
          })}
        >
          <CurrencyLogo logo={currencyLogo} size={18} />
          {row.original.status === 'correction' &&
            row.original.total > 0 &&
            '-'}
          {formatCurrencyNumber(row.original.total)}
        </p>
      );
    }
  },
  {
    accessorKey: 'fees',
    header: t('fees'),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <p
            className={cn('flex items-center gap-1', {
              'line-through':
                row.original.status === 'refunded' && row.original.fees === 0,
              'rounded-full bg-red-100 px-2 py-1 font-medium':
                row.original.status === 'refunded' && row.original.fees > 0
            })}
          >
            <CurrencyLogo logo={currencyLogo} size={18} />
            {row.original.status === 'correction' &&
              row.original.fees > 0 &&
              '-'}
            {formatCurrencyNumber(row.original.fees)}
          </p>
        </div>
      );
    }
  },
  {
    accessorKey: 'net',
    header: t('net'),
    cell: ({ row }) => {
      return (
        <p
          className={cn('flex w-8 items-center gap-1', {
            'line-through': row.original.status === 'refunded'
          })}
        >
          <CurrencyLogo logo={currencyLogo} size={18} />
          {row.original.status === 'correction' &&
            row.original.total > 0 &&
            '-'}
          {formatCurrencyNumber(row.original.total - row.original.fees)}
        </p>
      );
    }
  },
  {
    accessorKey: 'status',
    header: t('status'),
    cell: ({ row }) => {
      return (
        <span
          className={cn('rounded-full px-2 py-1 text-xs font-medium', {
            'bg-green-100 text-green-800': row.original.status === 'paid',
            'bg-yellow-100 text-yellow-800': row.original.status === 'pending',
            'bg-red-100 text-red-800': row.original.status === 'cancelled',
            'bg-gray-100 text-gray-800': row.original.status === 'refunded'
          })}
        >
          {t(row.original.status) || row.original.status}
        </span>
      );
    }
  },
  {
    accessorKey: 'type',
    header: t('type'),
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
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'action',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <>
          {row.original?.processor_tx && row.original?.status === 'paid' && (
            <Button onClick={() => onRefundClick(row.original.id)}>
              {t('refund')}
            </Button>
          )}
        </>
      );
    }
  }
];

export const OrdersPage: React.FC<Props> = ({
  place,
  orders,
  currencyLogo,
  pagination,
  total
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('order');
  // Initialize state from searchParams
  const initialDateRange = searchParams.get('dateRange') || 'last7days';
  const initialStartDate = searchParams.get('startDate') || '';
  const initialEndDate = searchParams.get('endDate') || '';

  const [dateRange, setDateRange] = useState(initialDateRange);
  const [customStartDate, setCustomStartDate] = useState(initialStartDate);
  const [customEndDate, setCustomEndDate] = useState(initialEndDate);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<number | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const onPaginationChange = useCallback(
    (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      const newState =
        typeof updaterOrValue === 'function'
          ? updaterOrValue({
              pageIndex: pagination.offset / pagination.limit,
              pageSize: pagination.limit
            })
          : updaterOrValue;

      const params = new URLSearchParams(searchParams);
      params.set('offset', (newState.pageIndex * newState.pageSize).toString());
      params.set('limit', newState.pageSize.toString());
      params.set('dateRange', dateRange);
      if (dateRange === 'custom') {
        params.set('startDate', customStartDate);
        params.set('endDate', customEndDate);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [
      pathname,
      router,
      searchParams,
      pagination,
      dateRange,
      customStartDate,
      customEndDate
    ]
  );

  // Handle date range change
  const handleDateRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newRange = event.target.value;
    setDateRange(newRange);
    const params = new URLSearchParams(searchParams);
    params.set('dateRange', newRange);
    params.set('offset', '0');
    if (newRange !== 'custom') {
      params.delete('startDate');
      params.delete('endDate');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle custom date changes
  const handleCustomDateChange = (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => {
    if (
      dateRange === 'custom' &&
      (startDate || customStartDate) &&
      (endDate || customEndDate)
    ) {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set('dateRange', 'custom');
      params.set('startDate', startDate?.toISOString() || customStartDate);
      params.set('endDate', endDate?.toISOString() || customEndDate);
      params.set('offset', '0');
      setIsLoading(false);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Export to CSV function
  const exportToCSV = async () => {
    const csvHeaders = [
      t('id'),
      t('date'),
      t('time'),
      t('total'),
      t('fees'),
      t('net'),
      t('status'),
      t('type'),
      t('terminal'),
      t('description')
    ];

    const csvData = await exportCsvAction(
      place.id,
      dateRange,
      csvHeaders,
      customStartDate,
      customEndDate
    );

    if (!csvData) {
      toast.error('No orders found for the given place and date range.');
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${place.id}_${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Date range options
  const dateRangeOptions = [
    { value: 'today', label: t('today') },
    { value: 'yesterday', label: t('yesterday') },
    { value: 'last7days', label: t('last7days') },
    { value: 'thisMonth', label: t('thisMonth') },
    { value: 'lastMonth', label: t('lastMonth') },
    { value: 'custom', label: t('customRange') }
  ];

  const handleRefundClick = (orderId: number) => {
    setOrderToRefund(orderId);
    setIsRefundModalOpen(true);
  };

  const handleRefundConfirm = async () => {
    if (!orderToRefund) return;

    try {
      setRefundLoading(true);
      await postRefundAction(orderToRefund);
      toast.success(t('refundSuccess'));
      router.refresh();
    } catch (error) {
      toast.error(t('refundError'));
      console.error(error);
    } finally {
      setRefundLoading(false);
      setIsRefundModalOpen(false);
      setOrderToRefund(null);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Heading
              title={place.name}
              description={`${t('ordersFor')} ${place.name}`}
            />
            <p className="flex items-center gap-1 text-2xl font-bold">
              <CurrencyLogo logo={currencyLogo} size={32} /> {total}
            </p>
          </div>
          {/* Export CSV Button  */}
          <button
            onClick={exportToCSV}
            className={cn(buttonVariants({ variant: 'outline' }), 'self-start')}
          >
            {t('exportAsCSV')}
          </button>
        </div>
        <Separator />
        {/* Date Range Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label htmlFor="dateRange" className="text-sm font-medium">
              {t('dateRange')}
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={handleDateRangeChange}
              className="rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range Inputs */}
          {dateRange === 'custom' && (
            <div className="flex items-center  gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="startDate" className="text-sm font-medium">
                  {t('startDate')}
                </label>

                <DatePicker
                  id="customStartDate"
                  value={
                    customStartDate ? new Date(customStartDate) : undefined
                  }
                  onChange={(date) => {
                    setCustomStartDate(date?.toISOString() ?? '');
                    handleCustomDateChange(date, undefined);
                  }}
                  placeholder="Select your date"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="endDate" className="text-sm font-medium">
                  {t('endDate')}
                </label>

                <DatePicker
                  id="customEndDate"
                  value={customEndDate ? new Date(customEndDate) : undefined}
                  onChange={(date) => {
                    setCustomEndDate(date?.toISOString() ?? '');
                    handleCustomDateChange(undefined, date);
                  }}
                  placeholder="Select your date"
                  className="w-full"
                />
              </div>
              {isLoading && <Loader2 className="mt-5 h-4 w-4 animate-spin" />}
            </div>
          )}
        </div>
        <div className="w-[92vw] overflow-x-auto md:w-full">
          <DataTable
            columns={createColumns(currencyLogo, t, handleRefundClick)}
            data={orders}
            pageCount={Math.ceil(pagination.totalItems / pagination.limit)}
            pageSize={pagination.limit}
            pageIndex={pagination.offset / pagination.limit}
            onPaginationChange={onPaginationChange}
          />
        </div>
      </div>

      <AlertModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onConfirm={handleRefundConfirm}
        loading={refundLoading}
        title={t('refundTitle')}
        description={t('refundDescription')}
        cancelText={t('cancel')}
        confirmText={t('refund')}
      />
    </PageContainer>
  );
};
