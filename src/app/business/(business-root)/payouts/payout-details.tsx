import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Payout } from '@/db/payouts';
import { icons } from 'lucide-react';
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
          <icons.Plus size={16} />
          New Payout
        </Button>
      </Link>

      <div>
        <DataTable
          columns={[
            { accessorKey: 'business_id', header: 'Business Name' },
            { accessorKey: 'place_id', header: 'Place Name' },
            { accessorKey: 'created_at', header: 'Created At' },
            { accessorKey: 'total', header: 'Total' },
            { accessorKey: 'status', header: 'from' }
          ]}
          data={[
            {
              business_id: 'Business 1',
              place_id: 'Place 1',
              created_at: '2021-01-01',
              total: 100,
              status: 'Pending'
            }
          ]}
        />
      </div>
    </div>
  );
}
