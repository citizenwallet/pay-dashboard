import { isUserAdminAction } from '@/actions/session';
import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';
import { getbusinessidAction, getLastPlaceAction, getPlaceAction, getPlacebyIdAction } from './action';
import { Place } from '@/db/places';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const admin = await isUserAdminAction();
  const places = await getPlaceAction()
  const businessId = await getbusinessidAction()
  const lastplace = await getPlacebyIdAction()


  return (
    <>
      <AppSidebar bussinessid={businessId}
        lastid={lastplace ?? {} as Place}
        places={places} isAdmin={admin}>{children}</AppSidebar>
    </>
  );
}
