import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { getUserById } from '@/db/users';
import { getServiceRoleClient } from '@/db';
import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppSidebar isAdmin={false}>{children}</AppSidebar>}>
      <AsyncSidebar>{children}</AsyncSidebar>
    </Suspense>
  );
}

async function AsyncSidebar({ children }: { children: React.ReactNode }) {
  const admin = await isUserAdminAction();

  const userId = await getUserIdFromSessionAction();

  const client = getServiceRoleClient();

  const { data: user } = await getUserById(client, userId);
  if (!user) {
    return null;
  }

  return (
    <>
      <AppSidebar user={user} isAdmin={admin}>
        {children}
      </AppSidebar>
    </>
  );
}
