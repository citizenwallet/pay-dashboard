'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Place } from '@/db/places';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type PlaceRow = Pick<
  Place,
  'id' | 'name' | 'slug' | 'image' | 'accounts' | 'description'
>;

const columns: ColumnDef<PlaceRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/places/${row.original.id}/orders`}
          className="hover:underline"
        >
          {row.original.name}
        </Link>
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'accounts',
    header: 'Accounts',
    cell: ({ row }) => {
      return row.original.accounts?.length || 0;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            const place = row.original;
            window.location.href = `/dashboard/places/${place.id}/orders`;
          }}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      );
    }
  }
];

interface Props {
  places: PlaceRow[];
}

export default function PlaceListingPage({ places }: Props) {
  return <DataTable columns={columns} data={places} />;
}
