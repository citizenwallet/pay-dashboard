import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { auth } from '@/auth';
import { getServiceRoleClient } from '@/db';
import { updateLastplace } from '@/db/users';
import { redirect } from 'next/navigation';
import {
  checkUserAccessBusinessAction,
  getBusinessPlacesAction,
  getLastPlaceAction
} from './places/[placeId]/action';
import { getBusinessById } from '@/db/business';

export default async function BusinessDetailsPage({
  params
}: {
  params: Promise<{ businessId: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth();
  const client = getServiceRoleClient();

  if (!session?.user) {
    return redirect('/login');
  } else {
    const admin = await isUserAdminAction();
    if (admin) {
      const places = await getBusinessPlacesAction(
        Number(resolvedParams.businessId)
      );

      if (!places || places.length === 0) {
        return redirect('/business');
      }

      const userId = await getUserIdFromSessionAction();

      const data = await updateLastplace(client, userId, places[0].id);

      return redirect(
        `/business/${resolvedParams.businessId}/places/${places[0].id}/orders`
      );
    }

    const hasAccess = await checkUserAccessBusinessAction(
      Number(resolvedParams.businessId)
    );
    if (!hasAccess) {
      return redirect('/business');
    }

    //check if the business is accepted agreement
    const business = await getBusinessById(
      client,
      Number(resolvedParams.businessId)
    );
    if (
      !business.data?.accepted_membership_agreement ||
      !business.data?.accepted_terms_and_conditions
    ) {
      return redirect(`/business/${resolvedParams.businessId}/legal`);
    }

    const place = await getLastPlaceAction();
    return redirect(
      `/business/${resolvedParams.businessId}/places/${place?.id}/orders`
    );
  }
}
