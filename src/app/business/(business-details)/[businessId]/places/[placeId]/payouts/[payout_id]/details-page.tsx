'use client';
import OrderViewTable from './order-details';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPayoutCSVAction } from './action';
import { toast } from 'sonner';
import { Order } from '@/db/orders';
import { useTranslations } from 'next-intl';

export default function PayoutDetailsPage({
  payout_id,
  orders,
  currencyLogo
}: {
  payout_id: string;
  orders: Order[];
  currencyLogo: string;
}) {
  const t = useTranslations('payouts');
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
        <button
          onClick={handleCSVDownload}
          className={cn(buttonVariants({ variant: 'outline' }), 'ml-auto')}
        >
          {t('exportCSV')}
        </button>
      </div>

      <OrderViewTable orders={orders} currencyLogo={currencyLogo} />
    </>
  );
}
