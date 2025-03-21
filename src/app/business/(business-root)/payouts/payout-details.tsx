'use client';

import CurrencyLogo from '@/components/currency-logo';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
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

  return (
    <div className="flex flex-col gap-4">
      <Link href="/business/payouts/new">
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          New Payout
        </Button>
      </Link>

      <DataTable
        columns={[
          {
            accessorKey: 'id',
            header: 'Id',
            cell: ({ row }) => (
              <Link href={`/business/payouts/${row.original.id}`}>
                {row.original.id}
              </Link>
            )
          },
          { accessorKey: 'business_id', header: 'Business Name' },
          { accessorKey: 'place_id', header: 'Place Name' },
          {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: ({ row }) =>
              new Date(row.original.created_at).toLocaleString().split(',')[0]
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
            accessorKey: 'burn',
            header: 'Burn',
            cell: ({ row }) => (
              <div className="flex items-center space-x-2">
                <span className="text-red-500">
                  {row.original.burn ? '🔥' : '-'}
                </span>
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
                            { year: 'numeric', month: 'short', day: 'numeric' }
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
            cell: ({ row }) => (
              <div className="flex items-center space-x-2">
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
                        handleSaveEditTransferDate(
                          row.original.id,
                          e.target.value
                        );
                      }}
                      autoFocus
                      className="h-8 w-36"
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
                        ? new Date(
                            row.original.transferDate
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'}
                    </span>
                  </div>
                )}
              </div>
            )
          }
        ]}
        data={payoutData}
      />
    </div>
  );
}
