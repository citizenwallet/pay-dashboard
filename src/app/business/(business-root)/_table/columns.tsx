'use client';

import CurrencyLogo from '@/components/currency-logo';
import { Skeleton } from '@/components/ui/skeleton';
import Config from '@/cw/community.json';
import { Business, BusinessSearch } from '@/db/business';
import { CommunityConfig } from '@citizenwallet/sdk';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';

export const columns: ColumnDef<BusinessSearch>[] = [
  {
    header: 'Name',
    accessorKey: 'business.name',
    cell: ({ row }) => {
      return (
        <Link href={`/business/${row.original.id}`} key={row.original.id}>
          <div className="flex cursor-pointer items-center gap-3 hover:bg-accent hover:bg-gray-200">
            <div className="h-8 w-8 flex-shrink-0 ">
              <span className="text-sm  text-primary">
                <Image
                  src={'/shop.png'}
                  alt="Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-md object-cover"
                />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {row.original.name}
              </span>
            </div>
          </div>
        </Link>
      );
    }
  },
  {
    header: 'VAT Number',
    accessorKey: 'vat_number',
    cell: ({ row }) => {
      return <div className="min-w-[120px]">{row.original.vat_number}</div>;
    }
  },
  {
    header: 'Balance',
    accessorKey: 'balance',
    cell: ({ row }) => {
      const community = new CommunityConfig(Config);
      const currencyLogo = community.community.logo;

      const balance = row.original.places.reduce(
        (acc, place) =>
          acc +
          place.balances
            .filter(
              (balance) => balance.token === community.primaryToken.address
            )
            .reduce((acc, balance) => acc + balance.balance, 0),
        0
      );

      return (
        <>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <CurrencyLogo logo={currencyLogo} size={20} />
            {(balance / 100).toFixed(2)}
          </p>
        </>
      );
    }
  }
];

export const skeletonColumns: ColumnDef<Business>[] = [
  {
    header: 'Name',
    accessorKey: 'community.name',
    cell: () => <Skeleton className="h-8 w-full" />
  },
  {
    header: 'VAT Number',
    accessorKey: 'vat_number',
    cell: () => <Skeleton className="h-4 w-full" />
  },
  {
    header: 'Balance',
    accessorKey: 'balance',
    cell: () => <Skeleton className="h-4 w-full" />
  }
];

export const placeholderData: Business[] = Array(5);
