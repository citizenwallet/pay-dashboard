'use client';

import CurrencyLogo from '@/components/currency-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  getAllPayoutAction,
  updatePayoutBurnDateAction,
  updatePayoutTransferDateAction
} from './action';

export default function PayoutDetailsPage({
  payouts,
  currencyLogo
}: {
  payouts: Payout[];
  currencyLogo: string;
}) {
  const [payoutData, setPayoutData] = useState<Payout[]>(payouts);
  const [editingIdBurnDate, setEditingIdBurnDate] = useState<string | null>(
    null
  );
  const [editBurnDate, setEditBurnDate] = useState<string>('');
  const dateInputRef = useRef<HTMLDivElement>(null);
  const [editingIdTransferDate, setEditingIdTransferDate] = useState<
    string | null
  >(null);
  const [editTransferDate, setEditTransferDate] = useState<string>('');
  const dateInputRefTransferDate = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'transfer', desc: false }
  ]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  // Fetch fresh data when component mounts or when router changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const freshData = await getAllPayoutAction();
        setPayoutData(freshData);
      } catch (error) {
        console.error('Failed to fetch fresh data:', error);
      }
    };
    fetchData();
  }, [router]);

  // Burn Date edit open
  const handleBurnEditClick = (id: string, date: Date) => {
    setEditingIdBurnDate(id);
    setEditingIdTransferDate(null);
    const formattedDate = date.toISOString().split('T')[0];
    setEditBurnDate(formattedDate);
  };

  // Burn Date edit save
  const handleSaveEditBurnDate = async (id: string, date: string) => {
    try {
      setPayoutData(
        payouts.map((p) => (p.id === id ? { ...p, burnDate: date } : p))
      );
      setEditingIdBurnDate(null);
      await updatePayoutBurnDateAction(id, date);
      toast.success('Burn date updated successfully');
    } catch (error) {
      toast.error('Failed to update burn date');
    }
  };

  // Transfer Date edit open
  const handleTransferEditClick = (id: string, date: Date) => {
    setEditingIdTransferDate(id);
    setEditingIdBurnDate(null);
    const formattedDate = date.toISOString().split('T')[0];
    setEditTransferDate(formattedDate);
  };

  // Transfer Date edit save
  const handleSaveEditTransferDate = async (id: string, date: string) => {
    try {
      setPayoutData(
        payouts.map((p) => (p.id === id ? { ...p, transferDate: date } : p))
      );
      setEditingIdTransferDate(null);
      await updatePayoutTransferDateAction(id, date);
      toast.success('Transfer date updated successfully');
    } catch (error) {
      toast.error('Failed to update transfer date');
    }
  };

  // Setup click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editingIdBurnDate &&
        dateInputRef.current &&
        !dateInputRef.current.contains(event.target as Node)
      ) {
        setEditingIdBurnDate(null);
      }
      if (
        editingIdTransferDate &&
        dateInputRefTransferDate.current &&
        !dateInputRefTransferDate.current.contains(event.target as Node)
      ) {
        setEditingIdTransferDate(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingIdBurnDate, editingIdTransferDate]);

  const columns: ColumnDef<Payout>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Id
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => (
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Business Name
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex h-16 items-center">{row.original.business_id}</div>
      )
    },
    {
      accessorKey: 'place_id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Place Name
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex h-16 items-center">{row.original.place_id}</div>
      )
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created At
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => (
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
      accessorKey: 'total',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
          <p className="flex h-16 w-8 items-center gap-1">
            <CurrencyLogo logo={currencyLogo} size={18} />
            {formatCurrencyNumber(row.original.total)}
          </p>
        );
      }
    },
    {
      accessorKey: 'burn',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Burn
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex h-16 items-center space-x-2">
          <span className="text-red-500">{row.original.burn ? '🔥' : '-'}</span>
          {editingIdBurnDate === row.original.id ? (
            <div ref={dateInputRef} className="flex items-center gap-1">
              <Input
                type="date"
                value={editBurnDate}
                onChange={(e) => {
                  setEditBurnDate(e.target.value);
                  handleSaveEditBurnDate(row.original.id, e.target.value);
                }}
                autoFocus
                className="h-8 w-36"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingIdBurnDate(null);
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span
                className="cursor-pointer hover:text-blue-500 hover:underline"
                onClick={() =>
                  row.original.burnDate &&
                  handleBurnEditClick(
                    row.original.id,
                    new Date(row.original.burnDate)
                  )
                }
              >
                {row.original.burnDate
                  ? new Date(row.original.burnDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }
                    )
                  : '-'}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'transfer',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Transfer
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex h-16 items-center space-x-2">
          <span className="text-blue-500">
            {row.original.transfer ? '🏛️' : '-'}
          </span>
          {editingIdTransferDate === row.original.id ? (
            <div
              ref={dateInputRefTransferDate}
              className="flex items-center gap-1"
            >
              <Input
                type="date"
                value={editTransferDate}
                onChange={(e) => {
                  setEditTransferDate(e.target.value);
                  handleSaveEditTransferDate(row.original.id, e.target.value);
                }}
                autoFocus
                className="h-8 w-36"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingIdTransferDate(null);
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span
                className="cursor-pointer hover:text-blue-500 hover:underline"
                onClick={() =>
                  row.original.transferDate &&
                  handleTransferEditClick(
                    row.original.id,
                    new Date(row.original.transferDate)
                  )
                }
              >
                {row.original.transferDate
                  ? new Date(row.original.transferDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }
                    )
                  : '-'}
              </span>
            </div>
          )}
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: payoutData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize
        });
        setPageIndex(newState.pageIndex);
        setPageSize(15);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(15);
      }
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <Link href="/business/payouts/new">
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          New Payout
        </Button>
      </Link>
      <div className="w-[90vw] overflow-x-auto md:w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mr-7 flex items-center justify-end px-2 py-4">
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  {'<'}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  {'>'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
