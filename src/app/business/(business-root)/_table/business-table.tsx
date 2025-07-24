'use client';

import SearchInput from '@/components/search-input';
import { DataTable } from '@/components/ui/data-table';
import { Business } from '@/db/business';
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
    businesses: (Business & { balance: number })[];
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
            <div className="flex items-center justify-end mb-4 pr-6">
                <SearchInput className="w-80" />
            </div>
            <div className="w-full h-full overflow-auto p-6 mb-10">

                <div className="min-w-[800px] h-full">
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

    )
}
