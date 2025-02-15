import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs';
import { OverviewPage } from '@/app/dashboard/overview/_components/overview-page';
import { getPlacesByBusinessId } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { Suspense } from 'react';
import { getUserIdFromSession } from '@/actions/session';
import { getUserBusinessId } from '@/db/users';

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

  const userId = await getUserIdFromSession();
  const businessId = await getUserBusinessId(client, userId);

  const { data: places } = await getPlacesByBusinessId(client, businessId);

  return (
    <OverviewPage
      key={key}
      places={places?.filter((place) => place !== null) ?? []}
    />
  );
}
