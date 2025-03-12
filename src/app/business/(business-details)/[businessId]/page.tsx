import { auth } from '@/auth';
import { getPlaceAction } from './action';
import { redirect } from 'next/navigation';

export default async function BusinessDetailsPage() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/login');
  } else {
    const data = await getPlaceAction();
    if (!data || !data.length) {
      return redirect('/business');
    }
    const place = data[0];
    return redirect(`/business/${place.business_id}/places/${place.id}/orders`);
  }
}
