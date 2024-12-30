import { SearchParams } from 'nuqs/parsers';
import ProfileViewPage from './_components/profile-view-page';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

type pageProps = {
  searchParams: SearchParams;
};

export const metadata = {
  title: 'Dashboard : Profile'
};

export default async function Page({ searchParams }: pageProps) {
  return <ProfileViewPage />;
}
