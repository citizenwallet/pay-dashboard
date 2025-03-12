import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { getLinkedBusinessAction } from '../(business-details)/[businessId]/action';
import { getServiceRoleClient } from '@/db';
import { getUserById } from '@/db/users';
import RootAppSidebar from '@/components/layout/root-sidebar';

export default async function BusinessRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const admin = await isUserAdminAction();
  const business = await getLinkedBusinessAction();
  const userId = await getUserIdFromSessionAction();
  const client = getServiceRoleClient();
  const { data: user } = await getUserById(client, userId);
  if (!user) {
    return null;
  }

  return (
    <>
      <RootAppSidebar business={business} isAdmin={admin} user={user}>
        {children}
      </RootAppSidebar>
    </>
  );
}
