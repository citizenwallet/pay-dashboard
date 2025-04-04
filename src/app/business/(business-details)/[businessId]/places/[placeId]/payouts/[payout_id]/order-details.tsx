'use client';
import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { Order } from '@/db/orders';
import { formatCurrencyNumber } from '@/lib/currency';
import { useTranslations } from 'next-intl';

export default function OrderViewTable({
  orders,
  currencyLogo
}: {
  orders: Order[];
  currencyLogo: string;
}) {
  const t = useTranslations('payouts');
  return (
    <>
      <DataTable
        columns={[
          { accessorKey: 'id', header: t('id') },
          {
            accessorKey: 'created_at',
            header: t('date'),
            cell: ({ row }) => {
              const date = new Date(row.original.created_at);
              return `${date.toLocaleDateString(
                'en-GB'
              )} ${date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}`;
            }
          },
          {
            accessorKey: 'total',
            header: t('total'),
            cell: ({ row }) => {
              return (
                <p className="flex w-8 items-center gap-1">
                  <CurrencyLogo logo={currencyLogo} size={18} />
                  {formatCurrencyNumber(row.original.total)}
                </p>
              );
            }
          }
        ]}
        data={orders}
      />
    </>
  );
}
