import { isUserAdminAction } from '@/actions/session';
import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';
import { getPlaceAction } from './action';
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

  return (
    <>
      <AppSidebar bussinessid={118} places={places} isAdmin={admin}>{children}</AppSidebar>
    </>
  );
}
