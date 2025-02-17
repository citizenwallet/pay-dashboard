import ProfileViewPage from './_components/profile-view-page';

type pageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata = {
  title: 'Dashboard : Profile'
};

export default async function Page({ searchParams }: pageProps) {
  return <ProfileViewPage />;
}
