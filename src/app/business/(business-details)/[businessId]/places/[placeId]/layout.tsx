import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import AppSidebar from '@/components/layout/app-sidebar';
import { getServiceRoleClient } from '@/db';
import { Business } from '@/db/business';
import { checkUserPlaceAccess, Place } from '@/db/places';
import { getUserById } from '@/db/users';
import type { Metadata } from 'next';
import {
  changeLastPlaceAction,
  getBusinessAction,
  getLinkedBusinessAction,
  getPlaceAction,
  getPlaceByIdAction
} from './action';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const { businessId } = await params;
  const { placeId } = await params;

  let places: Place[] = [];
  let business: Business = {} as Business;
  let lastplace: Place = {} as Place;

  const userId = await getUserIdFromSessionAction();
  const client = getServiceRoleClient();

  const { data: user } = await getUserById(client, userId);
  if (!user) {
    return null;
  }

  const admin = await isUserAdminAction();

  if (admin) {
    const adminBusiness = await getBusinessAction(Number(businessId));
    if (adminBusiness) {
      business = adminBusiness;
    }

    const userLastPlace = await getPlaceByIdAction(Number(placeId));
    if (userLastPlace) {
      lastplace = userLastPlace;
    }
  } else {
    const hasPlaceAccess = await checkUserPlaceAccess(
      client,
      userId,
      Number(placeId)
    );
    if (!hasPlaceAccess) {
      throw new Error('You do not have access to this place');
    }

    const userPlaces = await getPlaceAction();
    if (userPlaces) {
      places = userPlaces;
    }

    const userBusiness = await getLinkedBusinessAction();
    if (userBusiness) {
      business = userBusiness;
    }

    const userLastPlace = await getPlaceByIdAction(Number(placeId));
    if (userLastPlace) {
      lastplace = userLastPlace;
    }

    await changeLastPlaceAction(Number(placeId));
  }

  return (
    <>
      <AppSidebar
        business={business}
        lastPlace={lastplace ?? ({} as Place)}
        isAdmin={admin}
        user={user}
      >
        {children}
      </AppSidebar>
    </>
  );
}
