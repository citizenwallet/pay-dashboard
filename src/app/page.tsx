import React from 'react';
import SignInViewPage from '@/app/(auth)/_components/sigin-view';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/login');
  } else {
    return  redirect('/dashboard');
  }
}
