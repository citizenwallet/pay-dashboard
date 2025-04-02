'use client';

import CurrencyLogo from '@/components/currency-logo';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import { Column, PaginationState, Row } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  updatePayoutBurnDateAction,
  updatePayoutTransferDateAction
} from './action';

export default function PayoutDetailsPage({
  payouts,
  currencyLogo,
  count,
  limit,
  offset
}: {
  payouts: Payout[];
  currencyLogo: string;
  count: number;
  limit: number;
  offset: number;
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
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    setPayoutData(payouts);
  }, [payouts]);

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

  const handleSorting = (column: Column<Payout>, order: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('column', column.id);
    params.set('order', order);
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns = [
    {
      accessorKey: 'id',
      header: ({ column }: { column: Column<Payout> }) => {
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
            Id
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<Payout> }) => (
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
      header: 'Business Name',
      cell: ({ row }: { row: Row<Payout> }) => (
        <div className="flex h-16 items-center">{row.original.business_id}</div>
      )
    },
    {
      accessorKey: 'place_id',
      header: 'Place Name',
      cell: ({ row }: { row: Row<Payout> }) => (
        <div className="flex h-16 items-center">{row.original.place_id}</div>
      )
    },
    {
      accessorKey: 'created_at',
      header: ({ column }: { column: Column<Payout> }) => {
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
            Created At
            {column.getIsSorted() === 'asc'
              ? ' ↑'
              : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
          </Button>
        );
      },
      cell: ({ row }: { row: Row<Payout> }) => (
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
      header: ({ column }: { column: Column<Payout> }) => {
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
      cell: ({ row }: { row: Row<Payout> }) => {
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
      header: 'Burn',
      cell: ({ row }: { row: Row<Payout> }) => (
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
      header: 'Transfer',
      cell: ({ row }: { row: Row<Payout> }) => (
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link href="/business/payouts/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            New Payout
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
        />
      </div>
    </div>
  );
}
