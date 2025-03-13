'use client';
import { DataTable } from '@/components/ui/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { createPayoutAction, getOrdersAction } from './action';
import { Order } from '@/db/orders';
import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function OrderView({
  place,
  dateRange
}: {
  place: number | null;
  dateRange: DateRange | undefined;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 5; // Define how many items per page
  const router = useRouter();
  useEffect(() => {
    setOrders([]);
    setIsLoading(true);
    setTotal(0);

    const fetchOrders = async () => {
      try {
        if (place && dateRange?.from && dateRange?.to) {
          const data = await getOrdersAction(
            Number(place),
            dateRange.from.toISOString(),
            dateRange.to.toISOString()
          );
          setOrders(data.data ?? []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [place, dateRange]);

  useEffect(() => {
    const calculatedTotal = orders.reduce((acc, order) => acc + order.total, 0);
    setTotal(calculatedTotal);
  }, [orders]);

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

  if (isLoading) {
    return (
      <div>
        <DataTableSkeleton columnCount={3} rowCount={3} />
      </div>
    );
  }

  // Function to handle creating a payout
  const handleSubmit = async () => {
    if (place && dateRange && orders.length > 0) {
      try {
        const admin = await isUserAdminAction();
        if (!admin) {
          return <div>You are not authorized to view this page</div>;
        }
        const userId = await getUserIdFromSessionAction();
        const payoutResponse = await createPayoutAction(
          place,
          userId.toString(),
          dateRange.from ? dateRange.from.toISOString() : '',
          dateRange.to ? dateRange.to.toISOString() : '',
          total
        );

        toast.success('Payout created successfully', {
          onAutoClose: () => {
            router.push('/business/payouts');
          }
        });
      } catch (error) {
        toast.error('Error creating payout');
      }
    } else {
      toast.error('No have orders to create payout');
    }
  };

  return (
    <div>
      <div className="mb-4 space-y-2">
        <label className="text-sm font-medium">Total Payout</label>
        <div className="flex items-center gap-2 rounded-md border border-gray-300 p-2">
          <span className="text-sm font-medium">{total}</span>
        </div>
      </div>

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

      <Button onClick={handleSubmit}>Create Payout</Button>
    </div>
  );
}
