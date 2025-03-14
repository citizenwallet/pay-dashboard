'use client';
import CurrencyLogo from '@/components/currency-logo';
import { DataTable } from '@/components/ui/data-table';
import { Order } from '@/db/orders';
import { formatCurrencyNumber } from '@/lib/currency';

export default function OrderViewTable({
  orders,
  currencyLogo
}: {
  orders: Order[];
  currencyLogo: string;
}) {
  return (
    <>
      <DataTable
        columns={[
          { accessorKey: 'id', header: 'ID' },
          {
            accessorKey: 'created_at',
            header: 'Date',
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
            header: 'Total',
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
