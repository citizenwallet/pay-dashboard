import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import React, { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { getItemsAction } from './action';
import ItemListing from './Item-listing';
import Config from '@/cw/community.json';
import { CommunityConfig } from '@citizenwallet/sdk';

export default async function itempage({
  params
}: {
  params: Promise<{ place_id: string }>;
}) {
  const { place_id } = await params;
  return (
    <div>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title="Items" description="Item of the place" />
            <Link
              href={`/dashboard/menu/${place_id}/new`}
              className={cn(buttonVariants(), 'text-xs md:text-sm')}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Link>
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            {ListItemLoader(place_id)}
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
}

async function ListItemLoader(place_id: string) {
  const items = await getItemsAction(parseInt(place_id));

  const community = new CommunityConfig(Config);

  return (
    <ItemListing
      currencyLogo={community.community.logo}
      items={items.data ?? []}
    />
  );
}
