import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import AppSidebar from '@/components/layout/app-sidebar';
import type { Metadata } from 'next';
import {
  getPlaceAction,
  getLastPlaceAction,
  getLinkedBusinessAction,
  getBusinessPlacesAction,
  getBusinessAction,
  getPlaceByIdAction
} from './action';
import { checkUserPlaceAccess, Place } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { getUserById } from '@/db/users';
import { Business } from '@/db/business';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { businessId: string; placeId: string };
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
    const adminbusiness = await getBusinessAction(Number(businessId));
    if (adminbusiness) {
      business = adminbusiness;
    }

    const adminplaces = await getBusinessPlacesAction(Number(businessId));
    if (adminplaces) {
      places = adminplaces;
      lastplace = adminplaces[0];
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
