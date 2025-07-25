import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getBusinessById } from '@/db/business';
import { getServiceRoleClient } from '@/db';
import { getUserLastPlace } from '@/db/users';

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect('/login');
  } else {
    //check the user completed the registation flow
    const client = getServiceRoleClient();
    const { data: user, error } = await getUserLastPlace(
      client,
      Number(session.user.id)
    );
    if (error || !user) {
      return redirect('/business');
    }

    if (user.place.business.status == 'Registered') {
      return redirect(
        `/business/${user.place.business.id}/places/${user.place.id}/orders`
      );
    } else {
      return redirect(
        `/onboarding/vat?invite_code=${user.place.business.invite_code}`
      );
    }
  }
}
