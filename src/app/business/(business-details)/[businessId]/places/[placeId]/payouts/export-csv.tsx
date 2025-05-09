'use client';

import { useTranslations } from 'next-intl';
import { getPayoutsCSVAction } from './action';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default function ExportCSV({ placeId }: { placeId: string }) {
  const t = useTranslations('payouts');

  const handleCSVDownload = async () => {
    const csvHeaders = [
      t('id'),
      t('date'),
      t('time'),
      t('from'),
      t('to'),
      t('total'),
      t('fees'),
      t('net'),
      t('status')
    ];

    const csvData = await getPayoutsCSVAction(placeId, csvHeaders);

    if (!csvData.trim()) {
      toast.error(t('noOrdersFound'));
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts_${placeId}.csv`; // Handle undefined values
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <button
      onClick={handleCSVDownload}
      className={cn(buttonVariants({ variant: 'outline' }), 'ml-auto')}
    >
      {t('exportCSV')}
    </button>
  );
}
