import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPlaceAction } from './action';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/login');
  } else {
    const data = await getPlaceAction();
    return redirect(`/business/${data.busid}/places/${data.lastId}/orders`);
  }
}
