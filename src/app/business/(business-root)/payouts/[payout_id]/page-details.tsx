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

export default function PayoutDetailsPage({
  payout_id,
  orders
}: {
  payout_id: string;
  orders: Order[];
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const router = useRouter();
  const handleOpenModal = (type: 'burn' | 'transferred') => {
    setAction(type);
    setOpen(true);
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
        <div className="flex items-center gap-2">
          <Button onClick={() => handleOpenModal('burn')}>Set As Burnt</Button>
          <Button onClick={() => handleOpenModal('transferred')}>
            Set As Transferred
          </Button>

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
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirm}>
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

      <OrderViewTable orders={orders ?? []} />
    </>
  );
}
