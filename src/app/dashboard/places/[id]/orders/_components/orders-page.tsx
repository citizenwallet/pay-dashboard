'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { cn, humanizeDate } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Place } from '@/db/places';
import { Order } from '@/db/orders';
import { formatCurrencyNumber } from '@/lib/currency';
import CurrencyLogo from '@/components/currency-logo';

interface Props {
  place: Place;
  orders: Order[];
  currencyLogo: string;
}

const createColumns = (currencyLogo: string): ColumnDef<Order>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return row.original.id;
    }
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      return humanizeDate(row.original.created_at);
    }
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      return (
        <p className="flex items-center gap-1">
          <CurrencyLogo logo={currencyLogo} size={18} />
          {formatCurrencyNumber(row.original.total)}
        </p>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <span
          className={cn('rounded-full px-2 py-1 text-xs font-medium', {
            'bg-green-100 text-green-800': row.original.status === 'paid',
            'bg-yellow-100 text-yellow-800': row.original.status === 'pending',
            'bg-red-100 text-red-800': row.original.status === 'cancelled'
          })}
        >
          {row.original.status}
        </span>
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'Description'
  }
];

export const OrdersPage: React.FC<Props> = ({
  place,
  orders,
  currencyLogo
}) => {
  const t = useTranslations();

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/dashboard/overview"
              className={cn(buttonVariants({ variant: 'ghost' }), 'mb-2')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Places
            </Link>
            <Heading
              title={place.name}
              description={`Orders for ${place.name}`}
            />
          </div>
        </div>
        <Separator />
        <DataTable columns={createColumns(currencyLogo)} data={orders} />
      </div>
    </PageContainer>
  );
};
