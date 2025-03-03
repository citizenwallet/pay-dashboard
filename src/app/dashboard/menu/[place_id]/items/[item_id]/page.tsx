import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@radix-ui/react-separator';
import { Suspense } from 'react';
import { getItemAction } from './action';
import ItemListing from './itemData';

export default async function ViewItem({
  params
}: {
  params: Promise<{ place_id: string; item_id: string }>;
}) {
  const resolvedParams = await params;
  return (
    <div>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title="View Item Details"
              description="View item information"
            />
          </div>
          <Separator />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Suspense fallback={<div>Loading...</div>}>
              <ItemDetailsLoader resolvedParams={resolvedParams} />
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

async function ItemDetailsLoader({
  resolvedParams
}: {
  resolvedParams: { place_id: string; item_id: string };
}) {
  const item = await getItemAction(
    resolvedParams.place_id,
    resolvedParams.item_id
  );

  if (!item.data) {
    return <div>Item not found</div>;
  }
  return <ItemListing item={item.data} />;
}
