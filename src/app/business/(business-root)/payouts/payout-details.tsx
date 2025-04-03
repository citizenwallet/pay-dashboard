'use client';

import CurrencyLogo from '@/components/currency-logo';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  updatePayoutBurnDateAction,
  updatePayoutTransferDateAction,
  getAllPayoutAction
} from './action';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('rootpayouts');

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
      toast.success(t('burndateupdatedsuccessfully'));
    } catch (error) {
      toast.error(t('failedtoupdateburndate'));
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
      toast.success(t('transferdateupdatedsuccessfully'));
    } catch (error) {
      toast.error(t('failedtotransferdate'));
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

  return (
    <div className="flex flex-col gap-4">
      <Link href="/business/payouts/new">
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          {t('newpayout')}
        </Button>
      </Link>
      <div className="w-[90vw] overflow-x-auto md:w-full">
        <DataTable
          columns={[
            {
              accessorKey: 'id',
              header: t('Id'),
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
              header: t('businessname'),
              cell: ({ row }) => (
                <div className="flex h-16 items-center">
                  {row.original.business_id}
                </div>
              )
            },
            {
              accessorKey: 'place_id',
              header: t('placename'),
              cell: ({ row }) => (
                <div className="flex h-16 items-center">
                  {row.original.place_id}
                </div>
              )
            },
            {
              accessorKey: 'created_at',
              header: t('createdat'),
              cell: ({ row }) => (
                <div className="flex h-16 items-center">
                  {row.original.created_at
                    ? new Date(row.original.created_at).toLocaleString(
                        'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )
                    : '-'}
                </div>
              )
            },
            {
              accessorKey: 'total',
              header: t('total'),
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
              header: t('burn'),
              cell: ({ row }) => (
                <div className="flex h-16 items-center space-x-2">
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
                          handleSaveEditBurnDate(
                            row.original.id,
                            e.target.value
                          );
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
              header: t('transfer'),
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
                          handleSaveEditTransferDate(
                            row.original.id,
                            e.target.value
                          );
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
    </div>
  );
}
