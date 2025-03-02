import { isUserAdminAction } from '@/actions/session';
import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';

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

  return (
    <>
      <AppSidebar isAdmin={admin}>{children}</AppSidebar>
    </>
  );
}
