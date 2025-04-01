'use client';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Order } from '@/db/orders';
import CurrencyLogo from '@/components/currency-logo';
import { formatCurrencyNumber } from '@/lib/currency';

type SortField = 'id' | 'created_at' | 'total';
type SortDirection = 'asc' | 'desc';

export default function OrderViewTable({
  orders,
  currencyLogo
}: {
  orders: Order[];
  currencyLogo: string;
}) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const itemsPerPage = 15; // Define how many items per page

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort the orders array
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === 'id') {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortField === 'created_at') {
      return sortDirection === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortField === 'total') {
      return sortDirection === 'asc' ? a.total - b.total : b.total - a.total;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const isFirstPage = page === 1;
  const isLastPage = page * itemsPerPage >= sortedOrders.length;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Get the current data slice for the page
  const currentData = sortedOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div>
      <DataTable
        columns={[
          {
            accessorKey: 'id',
            header: () => (
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-1 hover:text-primary"
              >
                ID
                {sortField === 'id' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            )
          },
          {
            accessorKey: 'created_at',
            header: () => (
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center gap-1 hover:text-primary"
              >
                Date
                {sortField === 'created_at' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ),
            cell: ({ row }) => {
              const date = new Date(row.original.created_at);
              return `${date.toLocaleDateString(
                'en-GB'
              )} ${date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}`;
            }
          },
          {
            accessorKey: 'total',
            header: () => (
              <button
                onClick={() => handleSort('total')}
                className="flex items-center gap-1 hover:text-primary"
              >
                Total
                {sortField === 'total' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ),
            cell: ({ row }) => {
              return (
                <p className="flex w-8 items-center gap-1">
                  <CurrencyLogo logo={currencyLogo} size={18} />
                  {formatCurrencyNumber(row.original.total)}
                </p>
              );
            }
          }
        ]}
        data={currentData}
      />
      {/* Pagination Controls */}
      <div className={cn('mt-4 flex items-center justify-center gap-2')}>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={isFirstPage}
          className={cn(
            'inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isFirstPage
              ? 'cursor-not-allowed border-input bg-background text-muted-foreground opacity-50'
              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1 px-2">
          <span className="text-sm font-medium">Page</span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
            {page}
          </span>
          <span className="text-sm font-medium">of {totalPages}</span>
        </div>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={isLastPage}
          className={cn(
            'inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isLastPage
              ? 'cursor-not-allowed border-input bg-background text-muted-foreground opacity-50'
              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
          )}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
