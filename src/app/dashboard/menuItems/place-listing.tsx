"use client"
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import { Place } from '@/db/places';

export default  function PlaceListing({ places }: { places: Place[] }) {

    return (
        <DataTable
            columns={[
                {
                    accessorKey: "name",
                    header: "Name",
                    cell: ({ row }) => (
                        <Link href={`/dashboard/places/${row.original.id}/orders`} className="hover:underline">
                            {row.original.name}
                        </Link>
                    )
                },
                {
                    accessorKey: "description",
                    header: "Description"
                },
                {
                    accessorKey: "business_id",
                    header: "Business ID"
                }
            ]}
            data={places}

        />
    );
}
