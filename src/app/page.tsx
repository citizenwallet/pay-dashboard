import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPlaceAction } from './action';
import { getBusinessById } from '@/db/business';
import { getServiceRoleClient } from '@/db';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/login');
  } else {
    //check the user completed the registation flow
    const data = await getPlaceAction();
    const client = getServiceRoleClient();
    const business = await getBusinessById(client, data.busid);
    if (business.data?.status == 'Registered') {
      return redirect(`/business/${data.busid}/places/${data.lastId}/orders`);
    } else {
      return redirect(
        `/onboarding/vat?invite_code=${business.data?.invite_code}`
      );
    }
  }
}
