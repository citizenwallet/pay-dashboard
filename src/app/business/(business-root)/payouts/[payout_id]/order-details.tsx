'use client';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Order } from '@/db/orders';

export default function OrderViewTable({ orders }: { orders: Order[] }) {
  const [page, setPage] = useState(1);

  const itemsPerPage = 5; // Define how many items per page

  // Pagination logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const isFirstPage = page === 1;
  const isLastPage = page * itemsPerPage >= orders.length;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Get the current data slice for the page
  const currentData = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div>
      <DataTable
        columns={[
          { accessorKey: 'id', header: 'ID' },
          {
            accessorKey: 'created_at',
            header: 'Date',
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
          { accessorKey: 'total', header: 'Total' }
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
