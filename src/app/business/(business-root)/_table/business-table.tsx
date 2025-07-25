'use client';

import SearchInput from '@/components/search-input';
import { DataTable } from '@/components/ui/data-table';
import { Business, BusinessSearch } from '@/db/business';
import { PaginationState } from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { columns } from './columns';

export default function BusinessTable({
  businesses,
  count,
  offset,
  limit
}: {
  businesses: BusinessSearch[];
  count: number;
  offset: number;
  limit: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const onPaginationChange = useCallback(
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

  return (
    <>
      <div className="mb-4 flex items-center justify-end pr-6">
        <SearchInput className="w-80" />
      </div>
      <div className="mb-10 h-full w-full overflow-auto p-6">
        <div className="h-full min-w-[800px]">
          <DataTable
            columns={columns}
            data={businesses}
            pageCount={Math.ceil(count / 15)}
            pageSize={15}
            pageIndex={offset / 15}
            onPaginationChange={onPaginationChange}
          />
        </div>
      </div>
    </>
  );
}
