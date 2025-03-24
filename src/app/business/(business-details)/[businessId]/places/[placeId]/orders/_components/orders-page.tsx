'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { cn, humanizeDate } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Place } from '@/db/places';
import { Order } from '@/db/orders';
import { formatCurrencyNumber } from '@/lib/currency';
import CurrencyLogo from '@/components/currency-logo';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { exportCsvAction } from '../action';
import { toast } from 'sonner';

interface Props {
  place: Place;
  orders: Order[];
  currencyLogo: string;
  pagination: {
    limit: number;
    offset: number;
    totalItems: number;
  };
  balance: number;
}

const createColumns = (currencyLogo: string): ColumnDef<Order>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return row.original.id;
    }
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      return humanizeDate(row.original.created_at);
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
  },
  {
    accessorKey: 'fees',
    header: 'Fees',
    cell: ({ row }) => {
      return (
        <p className="flex w-8 items-center gap-1">
          <CurrencyLogo logo={currencyLogo} size={18} />
          {formatCurrencyNumber(row.original.fees)}
        </p>
      );
    }
  },
  {
    accessorKey: 'net',
    header: 'Net',
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
    header: 'Status',
    cell: ({ row }) => {
      return (
        <span
          className={cn('rounded-full px-2 py-1 text-xs font-medium', {
            'bg-green-100 text-green-800': row.original.status === 'paid',
            'bg-yellow-100 text-yellow-800': row.original.status === 'pending',
            'bg-red-100 text-red-800': row.original.status === 'cancelled'
          })}
        >
          {row.original.status}
        </span>
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
          <Button onClick={() => handleRefund(row)}>Refund</Button>
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
  balance
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from searchParams
  const initialDateRange = searchParams.get('dateRange') || 'today';
  const initialStartDate = searchParams.get('startDate') || '';
  const initialEndDate = searchParams.get('endDate') || '';

  const [dateRange, setDateRange] = React.useState(initialDateRange);
  const [customStartDate, setCustomStartDate] =
    React.useState(initialStartDate);
  const [customEndDate, setCustomEndDate] = React.useState(initialEndDate);

  const onPaginationChange = React.useCallback(
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
  const handleCustomDateChange = () => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      const params = new URLSearchParams(searchParams);
      params.set('dateRange', 'custom');
      params.set('startDate', customStartDate);
      params.set('endDate', customEndDate);
      params.set('offset', '0');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Export to CSV function
  const exportToCSV = async () => {
    const csvData = await exportCsvAction(
      place.id,
      dateRange,
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
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Heading
              title={place.name}
              description={`Orders for ${place.name}`}
            />
            <p className="flex items-center gap-1 text-2xl font-bold">
              <CurrencyLogo logo={currencyLogo} size={32} />{' '}
              {formatCurrencyNumber(balance, 0)}
            </p>
          </div>
          {/* Export CSV Button  */}
          <button
            onClick={exportToCSV}
            className={cn(buttonVariants({ variant: 'outline' }), 'self-start')}
          >
            Export as CSV
          </button>
        </div>
        <Separator />
        {/* Date Range Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label htmlFor="dateRange" className="text-sm font-medium">
              Date Range:
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
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date:
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
        <div className="w-[92vw] overflow-x-auto md:w-full">
          <DataTable
            columns={createColumns(currencyLogo)}
            data={orders}
            pageCount={Math.ceil(pagination.totalItems / pagination.limit)}
            pageSize={pagination.limit}
            pageIndex={pagination.offset / pagination.limit}
            onPaginationChange={onPaginationChange}
          />
        </div>
      </div>
    </PageContainer>
  );
};
