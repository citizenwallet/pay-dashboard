'use client';
import SearchInput from '@/components/search-input';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Place } from '@/db/places';
import { PaginationState, Row } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

export default function PlacesPage({
  place,
  offset,
  limit,
  search,
  count
}: {
  place: Place[];
  offset: number;
  limit: number;
  search: string | null;
  count: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const onPaginationChange = React.useCallback(
    (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      const newState =
        typeof updaterOrValue === 'function'
          ? updaterOrValue({
              pageIndex: offset / limit,
              pageSize: limit
            })
          : updaterOrValue;

      const params = new URLSearchParams(searchParams);
      params.set('offset', (newState.pageIndex * newState.pageSize).toString());
      params.set('limit', newState.pageSize.toString());

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, offset, limit]
  );

  const columns = [
    {
      header: 'id',
      accessorKey: 'id',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <Link href={`/places/${row.original.id}`}>{row.original.id}</Link>
        );
      }
    },
    {
      header: 'Image',
      accessorKey: 'image',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="flex items-center gap-2">
            <Image
              src={row.original.image || '/shop.png'}
              alt={row.original.name}
              width={70}
              height={70}
            />
          </div>
        );
      }
    },
    {
      header: 'Name',
      accessorKey: 'name'
    },
    {
      header: 'Description',
      accessorKey: 'description'
    },
    {
      header: 'Slug',
      accessorKey: 'slug'
    },
    {
      header: 'Visibility',
      accessorKey: 'hidden',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={!row.original.hidden}
              onCheckedChange={() => {}}
              disabled={loadingId === row.original.id}
              aria-label={`Toggle visibility for ${row.original.name}`}
            />
            <Label className="text-sm text-gray-600">
              {row.original.hidden ? 'Private' : 'Public'}
            </Label>
          </div>
        );
      }
    }
  ];

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-end">
        <SearchInput className="w-80" />
      </div>

      <div className="w-[95vw] overflow-x-auto md:w-full">
        <DataTable
          columns={columns}
          data={place}
          pageCount={Math.ceil(count / limit)}
          pageSize={limit}
          pageIndex={offset / limit}
          onPaginationChange={onPaginationChange}
        />
      </div>
    </div>
  );
}
