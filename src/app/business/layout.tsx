import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';
import {
  getBusinessAction,
  getPlaceAction,
  getPlacebyIdAction
} from './action';
import { Place } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { getUserById } from '@/db/users';

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
  const places = await getPlaceAction();
  const business = await getBusinessAction();
  const lastplace = await getPlacebyIdAction();
  const userId = await getUserIdFromSessionAction();
  const client = getServiceRoleClient();
  const { data: user } = await getUserById(client, userId);
  if (!user) {
    return null;
  }

  return (
    <>
      <AppSidebar
        business={business}
        lastPlace={lastplace ?? ({} as Place)}
        places={places}
        isAdmin={admin}
        user={user}
      >
        {children}
      </AppSidebar>
    </>
  );
}
