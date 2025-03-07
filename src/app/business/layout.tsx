import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { getUserById } from '@/db/users';
import { getServiceRoleClient } from '@/db';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import PosSidebar from '@/components/layout/pos-sidebar';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function PosLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PosSidebar isAdmin={false}>{children}</PosSidebar>}>
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
      <PosSidebar user={user} isAdmin={admin}>
        {children}
      </PosSidebar>
    </>
  );
}
