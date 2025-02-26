
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';

import { Separator } from '@/components/ui/separator';
import React, { Suspense } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { getAllPlacesData } from './action';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Place } from '@/db/places';
import Link from 'next/link';
import PlaceListing from './place-listing';

export default async function page() {



    return (
        <div>
            <PageContainer>
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <Heading
                            title="Places"
                            description="Manage your places"
                        />
                    </div>
                    <Separator />
                    <Suspense
                        fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
                    >
                        {placeListloader()}
                    </Suspense>

                </div>
            </PageContainer>
        </div>
    )
}


async function placeListloader() {
    const places = await getAllPlacesData();
    return <PlaceListing places={places.data ?? []} />;
}