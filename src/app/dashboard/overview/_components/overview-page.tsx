'use client';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React, { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import PlaceListingPage from './place-listing';
import { Place } from '@/db/places';

type Props = {
  key: string;
  places: Pick<
    Place,
    'id' | 'name' | 'slug' | 'image' | 'accounts' | 'description'
  >[];
};

export const OverviewPage: React.FC<Props> = ({ key, places }) => {
  const t = useTranslations();

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Places"
            description="Manage your places and their orders"
          />
          <Link
            href="/dashboard/places/new"
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Place
          </Link>
        </div>
        <Separator />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <PlaceListingPage places={places} />
        </Suspense>
      </div>
    </PageContainer>
  );
};
