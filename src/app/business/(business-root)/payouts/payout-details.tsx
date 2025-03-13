'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Payout } from '@/db/payouts';
import { GripVertical, Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function PayoutDetailsPage({
  payouts
}: {
  payouts: Payout[] | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/business/payouts/new">
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          New Payout
        </Button>
      </Link>

      <div>
        <DataTable
          columns={[
            {
              accessorKey: 'id',
              header: '',
              cell: ({ row }) => (
                <Link href={`/business/payouts/${row.original.id}`}>
                  <GripVertical />
                </Link>
              )
            },
            { accessorKey: 'business_id', header: 'Business Name' },
            { accessorKey: 'place_id', header: 'Place Name' },
            {
              accessorKey: 'created_at',
              header: 'Created At',
              cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleString()
            },
            { accessorKey: 'total', header: 'Total' },
            { accessorKey: 'burn', header: 'from' }
          ]}
          data={payouts ?? []}
        />
      </div>
    </div>
  );
}
