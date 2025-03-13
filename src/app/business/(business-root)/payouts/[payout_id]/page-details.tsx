'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';
import OrderViewTable from './order-details';
import { getPayoutCSVAction } from './action';
import { toast } from 'sonner';
import { Order } from '@/db/orders';

export default function PayoutDetailsPage({
  payout_id,
  orders
}: {
  payout_id: string;
  orders: Order[];
}) {
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
          <Button>Set As Burnt</Button>
          <Button>Set As Transferred</Button>
        </div>

        <button
          onClick={handleCSVDownload}
          className={cn(buttonVariants({ variant: 'outline' }), 'ml-auto')}
        >
          Export as CSV
        </button>
      </div>

      {/* Table goes here */}

      <OrderViewTable orders={orders ?? []} />
    </>
  );
}
