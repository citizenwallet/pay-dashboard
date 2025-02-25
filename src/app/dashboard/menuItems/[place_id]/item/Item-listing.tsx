"use client"
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import { Item } from '@/db/items';
import { icons } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { deleteItem } from './action';
import { useRouter } from "next/navigation";


export default function ItemListing({ Items }: { Items: Item[] }) {

    const [loading, setLoading] = useState<number | null>(null);
    const router = useRouter();

    const handleDelete = async (id: number) => {
        try {

            const item = Items.find(item => item.id === id);
            if (!item) return;
            setLoading(id);
            toast.custom((t) => (
                <div>
                    <h3>Are you sure you want to delete this item?</h3>
                    <p>This action cannot be undone</p>
                    <div className='flex justify-end gap-3 mt-4'>
                        <Button onClick={() => toast.dismiss(t)}>Cancel</Button>
                        <Button className='bg-red-600 hover:bg-red-700 text-white ml-4' onClick={async () => {
                            toast.dismiss(t);
                            const respose = await deleteItem(id);
                            if (respose.error) {
                                toast.error('Failed to delete item');
                            } else {
                                toast.success('Item deleted successfully');
                                router.refresh();
                            }
                        }}>Delete</Button>
                    </div>
                </div>
            ));



        } catch (error) {
            toast.error('Failed to delete item');
        } finally {
            setLoading(null);
        }
    };

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
                            <button
                                onClick={() => handleDelete(row.original.id)}
                                className="hover:text-red-600"
                                disabled={loading === row.original.id}
                            >
                                {loading === row.original.id ? (
                                    <icons.Loader className="animate-spin" size={20} />
                                ) : (
                                    <icons.Trash size={20} />
                                )}
                            </button>
                        </div>
                    )
                }

            ]}
            data={Items}

        />
    );
}
