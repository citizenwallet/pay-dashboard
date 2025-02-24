"use client"
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import { Item } from '@/db/items';
import { icons } from 'lucide-react';


export default  function ItemListing({ Items }: { Items: Item[] }) {

    function handleDelete(id: number): void {
        throw new Error('Function not implemented.');
    }

    return (
        <DataTable
            columns={[
                {
                    accessorKey: "image",
                    header: "Image",
                    cell: ({ row }) => (
                        <img src={row.original.image} alt={row.original.name} width={50} height={50} />
                    )
                },
                {
                    accessorKey: "name",
                    header: "Name"
                },
                {
                    accessorKey: "description",
                    header: "Description"
                },
                {
                    accessorKey: "price",
                    header: "Price"
                },
                {
                    accessorKey: "id",
                    header: "Action",
                    cell: ({ row }) => (
                        <div className="flex items-center gap-2">
                            <Link href={`/dashboard/menuItems/${row.original.id}/item`} className="hover:text-blue-600">
                                <icons.Eye size={20} />
                            </Link>
                            <Link href={`/dashboard/menuItems/${row.original.id}/edit`} className="hover:text-yellow-600">
                                <icons.Pen size={20} />
                            </Link>
                            <button onClick={() => handleDelete(row.original.id)} className="hover:text-red-600">
                                <icons.Trash size={20} />
                            </button>
                        </div>
                    )
                }

            ]}
            data={Items}

        />
    );
}
