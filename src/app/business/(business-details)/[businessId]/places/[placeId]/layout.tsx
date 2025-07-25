import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import AppSidebar from '@/components/layout/app-sidebar';
import { getServiceRoleClient } from '@/db';
import { Business, getBusinessById } from '@/db/business';
import { checkUserPlaceAccess, Place } from '@/db/places';
import { getUserById } from '@/db/users';
import type { Metadata } from 'next';
import {
  changeLastPlaceAction,
  getBusinessAction,
  getPlaceByIdAction
} from './action';
import { redirect } from 'next/navigation';
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

  let business: Business = {} as Business;
  let place: Place = {} as Place;

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

    const userPlace = await getPlaceByIdAction(Number(placeId));
    if (userPlace) {
      place = userPlace;
    }
  } else {
    //check if the business is accepted agreement
    const { data: businessData } = await getBusinessById(
      client,
      Number(businessId)
    );
    if (
      !businessData?.accepted_membership_agreement ||
      !businessData?.accepted_terms_and_conditions
    ) {
      redirect(`/business/${businessId}/legal`);
    }

    business = businessData;

    const hasPlaceAccess = await checkUserPlaceAccess(
      client,
      userId,
      Number(placeId)
    );
    if (!hasPlaceAccess) {
      throw new Error('You do not have access to this place');
    }

    const userPlace = await getPlaceByIdAction(Number(placeId));
    if (userPlace) {
      place = userPlace;
    }

    await changeLastPlaceAction(Number(placeId));
  }

  return (
    <>
      <AppSidebar business={business} place={place} isAdmin={admin} user={user}>
        {children}
      </AppSidebar>
    </>
  );
}
