'use client';

import { columns } from './columns';
import { Business } from '@/db/business';
import { DataTable } from '@/components/ui/data-table';
import SearchInput from '@/components/search-input';

export default function BusinessTable({
    businesses
}: {
    businesses: Business[]
}) {
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
                        pageCount={Math.ceil(businesses.length / 10)}
                        pageSize={10}
                        pageIndex={0}
                        onPaginationChange={() => { }}
                    />
                </div>

            </div>
        </>

    )
}
