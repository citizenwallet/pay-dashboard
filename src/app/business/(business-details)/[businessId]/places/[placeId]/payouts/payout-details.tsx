'use client';

import { DataTable } from '@/components/ui/data-table';
import { Payout } from '@/db/payouts';
import { GripVertical } from 'lucide-react';
import Link from 'next/link';

export default function PayoutDetailsPage({
  payouts,
  placeId,
  businessId
}: {
  payouts: Payout[];
  placeId: string;
  businessId: string;
}) {
  return (
    <>
      <DataTable
        columns={[
          {
            accessorKey: 'id',
            header: '',
            cell: ({ row }) => (
              <Link
                href={`/business/${businessId}/places/${placeId}/payouts/${row.original.id}`}
              >
                <GripVertical />
              </Link>
            )
          },
          {
            accessorKey: 'from',
            header: 'From',
            cell: ({ row }) =>
              new Date(row.original.from).toLocaleDateString('en-GB')
          },
          {
            accessorKey: 'to',
            header: 'To',
            cell: ({ row }) =>
              new Date(row.original.to).toLocaleDateString('en-GB')
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
                ? new Date(actionDate).toLocaleDateString('en-GB')
                : '-';

              if (burn) {
                statusIcon = (
                  <div className="flex flex-col ">
                    <span className="text-xl">🔥</span>
                    <span className="text-sm text-gray-500">
                      {formattedDate}
                    </span>
                  </div>
                );
              } else if (transfer) {
                statusIcon = (
                  <div className="flex flex-col ">
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
        data={payouts}
      />
    </>
  );
}
