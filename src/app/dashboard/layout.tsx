import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { getUserById } from '@/db/users';
import { getServiceRoleClient } from '@/db';
import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBusinessAction, getPlacebyIdAction } from '../business/action';
import { getPlaceAllAction } from '../action';
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncSidebar>{children}</AsyncSidebar>
    </Suspense>
  );
}

async function AsyncSidebar({ children }: { children: React.ReactNode }) {
  const admin = await isUserAdminAction();
  console.log(admin);

  const userId = await getUserIdFromSessionAction();

  const client = getServiceRoleClient();

  const { data: user } = await getUserById(client, userId);

  const places = await getPlaceAllAction();
  const business = await getBusinessAction();
  console.log(business);
  const lastplace = await getPlacebyIdAction();

  return (
    <>
      <AppSidebar
        user={user}
        isAdmin={admin}
        places={places ?? []}
        business={business}
        lastid={lastplace ?? ({} as Place)}
      >
        {children}
      </AppSidebar>
    </>
  );
}
