'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { humanizeDate } from '@/lib/utils';
import { Transaction } from '@/types/transaction';

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'updated_at',
    header: 'DATE',
    cell: ({ row }) => humanizeDate(row.original.updated_at as unknown as string)
  },
  {
    accessorKey: 'from',
    header: 'FROM',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image
              src={row.original.from.image_small}
              alt={row.original.from.name}
              fill
              className="rounded-full"
            />
          </div>
          <span>{row.original.from.name}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'to',
    header: 'TO',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image
              src={row.original.to.image_small}
              alt={row.original.to.name}
              fill
              className="rounded-full"
            />
          </div>
          <span>{row.original.to.name}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'value',
    header: 'VALUE'
  },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
];
