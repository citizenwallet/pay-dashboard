import { auth } from '@/auth';
import {
  checkUserAccessBusinessAction,
  getBusinessPlacesAction,
  getLastPlaceAction,
  getPlaceAction
} from './action';
import { redirect } from 'next/navigation';
import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';

export default async function BusinessDetailsPage({
  params
}: {
  params: Promise<{ businessId: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth();

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

    const place = await getLastPlaceAction();
    return redirect(
      `/business/${resolvedParams.businessId}/places/${place?.id}/orders`
    );
  }
}
