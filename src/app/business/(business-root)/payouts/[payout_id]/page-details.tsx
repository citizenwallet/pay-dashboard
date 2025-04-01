'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';
import OrderViewTable from './order-details';
import { getPayoutCSVAction, setPayoutStatusAction } from './action';
import { toast } from 'sonner';
import { Order } from '@/db/orders';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Payout } from '@/db/payouts';
import {
  updatePayoutBurnDateAction,
  updatePayoutTransferDateAction
} from '../action';

export default function PayoutDetailsPage({
  payout_id,
  orders,
  currencyLogo,
  payout
}: {
  payout_id: string;
  orders: Order[];
  currencyLogo: string;
  payout: Payout;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const router = useRouter();
  const handleOpenModal = (type: 'burn' | 'transferred') => {
    setAction(type);
    setOpen(true);
  };
  const [isBurnEditing, setIsBurnEditing] = useState(false);
  const [editingBurnDate, setEditingBurnDate] = useState(payout.burnDate || '');

  const [isTransferEditing, setIsTransferEditing] = useState(false);
  const [editingTransferDate, setEditingTransferDate] = useState(
    payout.transferDate || ''
  );

  const handleBurnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBurnSave();
    } else if (e.key === 'Escape') {
      setIsBurnEditing(false);
      setEditingBurnDate(payout.burnDate || '');
    }
  };

  const handleBurnSave = async () => {
    try {
      setIsBurnEditing(false);

      if (editingBurnDate == payout.burnDate) {
        return;
      }

      if (editingBurnDate) {
        await updatePayoutBurnDateAction(payout_id, editingBurnDate);
        toast.success(`Payout burn date updated successfully`);
      } else {
        toast.error(`Payout burn date is Empty,You can't update Empty Date`);
        setEditingBurnDate(payout.burnDate || '');
      }
    } catch (error) {
      toast.error(`Payout burn date update failed`);
    }
  };

  const handleTransferKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTransferSave();
    } else if (e.key === 'Escape') {
      setIsTransferEditing(false);
      setEditingTransferDate(payout.transferDate || '');
    }
  };

  const handleTransferSave = async () => {
    try {
      setIsTransferEditing(false);

      if (editingTransferDate == payout.transferDate) {
        return;
      }

      if (editingTransferDate) {
        await updatePayoutTransferDateAction(payout_id, editingTransferDate);
        toast.success(`Payout transfer date updated successfully`);
      } else {
        toast.error(
          `Payout transfer date is Empty,You can't update Empty Date`
        );
        setEditingTransferDate(payout.transferDate || '');
      }
    } catch (error) {
      toast.error(`Payout transfer date update failed`);
    }
  };

  const handleConfirm = async () => {
    try {
      await setPayoutStatusAction(payout_id, action);
      setOpen(false);
      toast.success(`Payout ${action} successfully`);
      router.push(`/business/payouts`);
    } catch (error) {
      toast.error(`Payout ${action} failed`);
      router.push(`/business/payouts`);
    }
  };

  const handleCSVDownload = async () => {
    const csvData = await getPayoutCSVAction(payout_id);

    if (!csvData.trim()) {
      toast.error('No orders found for the given place and date range.');
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
        <div className="flex items-center gap-7">
          <>
            {!payout.burn && (
              <Button className="mt-10" onClick={() => handleOpenModal('burn')}>
                Set As Burn
              </Button>
            )}
            {payout.burn && (
              <div className="flex flex-col items-center gap-4">
                {isBurnEditing ? (
                  <input
                    type="date"
                    value={editingBurnDate.split('T')[0]}
                    onChange={(e) => setEditingBurnDate(e.target.value)}
                    onKeyDown={(e) => handleBurnKeyDown(e)}
                    onBlur={() => handleBurnSave()}
                    autoFocus
                    className="w-full rounded border border-gray-300 p-1"
                    placeholder="Enter date"
                  />
                ) : (
                  <div
                    className="flex cursor-pointer items-center"
                    onClick={() => setIsBurnEditing(true)}
                  >
                    {editingBurnDate
                      ? new Date(editingBurnDate).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '-'}
                  </div>
                )}
                <Button variant="outline" disabled>
                  Already Burn
                </Button>
              </div>
            )}

            {!payout.transfer && (
              <Button
                className="mt-10"
                onClick={() => handleOpenModal('transferred')}
              >
                {' '}
                Set As Transferred{' '}
              </Button>
            )}
            {payout.transfer && (
              <div className="flex flex-col items-center gap-4">
                {isTransferEditing ? (
                  <input
                    type="date"
                    value={editingTransferDate.split('T')[0]}
                    onChange={(e) => setEditingTransferDate(e.target.value)}
                    onKeyDown={(e) => handleTransferKeyDown(e)}
                    onBlur={() => handleTransferSave()}
                    autoFocus
                    className="w-full rounded border border-gray-300 p-1"
                    placeholder="Enter date"
                  />
                ) : (
                  <div
                    className="flex cursor-pointer items-center"
                    onClick={() => setIsTransferEditing(true)}
                  >
                    {editingTransferDate
                      ? new Date(editingTransferDate).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : '-'}
                  </div>
                )}
                <Button variant="outline" disabled>
                  Already Transferred
                </Button>
              </div>
            )}
          </>

          {/* Confirmation Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cannot Reverse This Action!</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to set this as <strong>{action}</strong>?
              </p>
              <DialogFooter>
                <Button variant="destructive" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleConfirm}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <button
          onClick={handleCSVDownload}
          className={cn(buttonVariants({ variant: 'outline' }), 'ml-auto')}
        >
          Export as CSV
        </button>
      </div>

      <OrderViewTable orders={orders} currencyLogo={currencyLogo} />
    </>
  );
}
