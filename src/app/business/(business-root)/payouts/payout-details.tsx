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
            {
              accessorKey: 'status',
              header: 'Status',
              cell: ({ row }) => {
                const { burn, transfer, actionDate } = row.original;
                let statusIcon = null;

                // Format actionDate if available
                const formattedDate = actionDate
                  ? new Date(actionDate).toLocaleString()
                  : '-';

                if (burn) {
                  statusIcon = (
                    <div className="flex flex-col items-center">
                      <span className="text-xl">🔥</span>
                      <span className="text-sm text-gray-500">
                        {formattedDate}
                      </span>
                    </div>
                  );
                } else if (transfer) {
                  statusIcon = (
                    <div className="flex flex-col items-center">
                      <span className="text-xl">🏛️</span>
                      <span className="text-sm text-gray-500">
                        {formattedDate}
                      </span>
                    </div>
                  );
                }

                return statusIcon || <span className="text-gray-400">-</span>;
              }
            }
          ]}
          data={payouts ?? []}
        />
      </div>
    </div>
  );
}
