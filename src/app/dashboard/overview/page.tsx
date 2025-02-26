import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs';
import { OverviewPage } from '@/app/dashboard/overview/_components/overview-page';
import { getPlacesByBusinessId, getAllPlaces } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { Suspense } from 'react';
import { getUserIdFromSessionAction } from '@/actions/session';
import { getUserBusinessId } from '@/db/users';
import { isAdmin } from '@/db/users';

export const metadata = {
  title: 'Dashboard: Places'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncPage {...props} />
    </Suspense>
  );
}

async function AsyncPage(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const key = serialize({ ...searchParams });

  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();
  const businessId = await getUserBusinessId(client, userId);

  const admin = await isAdmin(client, userId);

  const { data: places } = admin
    ? await getAllPlaces(client)
    : await getPlacesByBusinessId(client, businessId);

  return <OverviewPage key={key} places={places ?? []} />;
}
