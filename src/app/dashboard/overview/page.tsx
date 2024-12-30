import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/parsers';
import { OverviewPage } from '@/app/dashboard/overview/_components/overview-page';

export const metadata = {
  title: 'Dashboard: Transactions'
};

type pageProps = {
  searchParams: SearchParams;
};

export default async function Page({ searchParams }: pageProps) {
  searchParamsCache.parse(searchParams);
  const key = serialize({ ...searchParams });

  return (
    <OverviewPage key={key} />
  );
}
