'use client';
import CurrencyLogo from '@/components/currency-logo';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Order } from '@/db/orders';
import { Payout } from '@/db/payouts';
import { formatCurrencyNumber } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  updatePayoutBurnDateAction,
  updatePayoutTransferDateAction
} from '../action';
import { getPayoutCSVAction, setPayoutStatusAction } from './action';
import OrderViewTable from './order-details';

export default function PayoutDetailsPage({
  payout_id,
  orders,
  currencyLogo,
  payout,
  totalAmount,
  count,
  limit,
  offset
}: {
  payout_id: string;
  orders: Order[];
  currencyLogo: string;
  payout: Payout;
  totalAmount: number;
  count: number;
  limit?: string;
  offset?: string;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const router = useRouter();
  const t = useTranslations('rootpayouts');
  const handleOpenModal = (type: 'burn' | 'transferred') => {
    setAction(type);
    setOpen(true);
  };
  const [editingBurnDate, setEditingBurnDate] = useState(payout.burnDate || '');

  const [editingTransferDate, setEditingTransferDate] = useState(
    payout.transferDate || ''
  );

  const handleBurnSave = async (date?: Date) => {
    try {
      if (date?.toISOString() == payout.burnDate) {
        return;
      }

      if (date) {
        await updatePayoutBurnDateAction(payout_id, date.toISOString());
        toast.success(t('payoutBurnDateUpdatedSuccessfully'));
      } else {
        toast.error(t('payoutBurnDateEmpty'));
        setEditingBurnDate(payout.burnDate || '');
      }
    } catch (error) {
      toast.error(t('payoutBurnDateUpdateFailed'));
    }
  };

  const handleTransferSave = async (date?: Date) => {
    try {
      if (date?.toISOString() == payout.transferDate) {
        return;
      }

      if (date) {
        await updatePayoutTransferDateAction(payout_id, date.toISOString());
        toast.success(t('payoutTransferDateUpdatedSuccessfully'));
      } else {
        toast.error(t('payoutTransferDateEmpty'));
        setEditingTransferDate(payout.transferDate || '');
      }
    } catch (error) {
      toast.error(t('payoutTransferDateUpdateFailed'));
    }
  };

  const handleConfirm = async () => {
    try {
      await setPayoutStatusAction(payout_id, action);
      setOpen(false);
      toast.success(`${t('payout')} ${action} ${t('successfully')}`);
      router.push(`/business/payouts/${payout_id}`);
    } catch (error) {
      toast.error(`${t('payout')} ${action} ${t('failed')}`);
      router.push(`/business/payouts/${payout_id}`);
    }
  };

  const handleCSVDownload = async () => {
    const csvData = await getPayoutCSVAction(payout_id);

    if (!csvData.trim()) {
      toast.error(t('noOrdersFound'));
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${payout_id}.csv`; // Handle undefined values
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <>
            {!payout.burn && (
              <Button className="mt-11" onClick={() => handleOpenModal('burn')}>
                {t('setAsBurn')}
              </Button>
            )}
            {payout.burn && (
              <div className="flex h-full flex-col items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="mb-5 flex cursor-pointer items-center">
                      {editingBurnDate
                        ? new Date(editingBurnDate).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        editingBurnDate ? new Date(editingBurnDate) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = date.getMonth();
                          const day = date.getDate();

                          const utcMidnightDate = new Date(
                            Date.UTC(year, month, day)
                          );
                          handleBurnSave(utcMidnightDate);
                          setEditingBurnDate(
                            utcMidnightDate ? utcMidnightDate.toISOString() : ''
                          );
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline" disabled>
                  {t('alreadyBurn')}
                </Button>
              </div>
            )}

            {!payout.transfer && (
              <Button
                className="mt-11"
                onClick={() => handleOpenModal('transferred')}
              >
                {t('setAsTransferred')}
              </Button>
            )}
            {payout.transfer && (
              <div className="flex h-full flex-col items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="mb-5 flex cursor-pointer items-center">
                      {editingTransferDate
                        ? new Date(editingTransferDate).toLocaleString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )
                        : '-'}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        editingTransferDate
                          ? new Date(editingTransferDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = date.getMonth();
                          const day = date.getDate();

                          const utcMidnightDate = new Date(
                            Date.UTC(year, month, day)
                          );
                          handleTransferSave(utcMidnightDate);
                          setEditingTransferDate(
                            utcMidnightDate ? utcMidnightDate.toISOString() : ''
                          );
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline" disabled>
                  {t('alreadyTransferred')}
                </Button>
              </div>
            )}
          </>

          {/* Confirmation Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('cannotReverseThisAction')}</DialogTitle>
              </DialogHeader>
              <p>
                {t('areYouSureYouWantToSetAs')} <strong>{action}</strong>?
              </p>
              <DialogFooter>
                <Button variant="destructive" onClick={() => setOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button variant="outline" onClick={handleConfirm}>
                  {t('confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <button
          onClick={handleCSVDownload}
          className={cn(buttonVariants({ variant: 'outline' }), 'ml-auto')}
        >
          {t('exportAsCSV')}
        </button>
      </div>

      <div className="mt-6 flex flex-col  justify-between pt-6">
        <div className="flex items-center gap-7">
          <p className="flex items-center gap-2">
            <b>{t('totalAmount')}:</b>
            <CurrencyLogo logo={currencyLogo} size={18} />
            {formatCurrencyNumber(totalAmount)}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-7">
          <p className="flex items-center gap-2">
            <b>{t('periodOfPayout')}:</b>
            <span>
              {new Date(payout.from).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}{' '}
              -{' '}
              {new Date(payout.to).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </p>
        </div>
      </div>

      <OrderViewTable
        orders={orders}
        currencyLogo={currencyLogo}
        count={count}
        limit={limit ?? '25'}
        offset={offset ?? '0'}
      />
    </>
  );
}
