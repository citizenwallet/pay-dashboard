import { Suspense } from 'react';
import PosPage from './pos';
import { getAllPlacesDataAction, isPosAlreadyActiveAction } from './action';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ErrorPage from './error-posid';
import { Loader } from 'lucide-react';

interface PosLayoutProps {
  params: Promise<{ posId: string }>;
}

export default async function PosLayout({ params }: PosLayoutProps) {
  const { posId } = await params;

  //check the user login or not
  const session = await auth();
  if (!session?.user) {
    return redirect('/login?redirectUrl=/pos/activate/' + posId);
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AsyncPage params={{ posId }} />
    </Suspense>
  );
}

async function AsyncPage({ params }: { params: { posId: string } }) {
  const posId = params.posId;

  const response = await getAllPlacesDataAction();
  const data = await isPosAlreadyActiveAction(posId);
  if (!data) {
    return <ErrorPage />;
  }
  return <PosPage posId={posId} places={response.data} />;
}
