
import { auth } from '@/auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import PosPage from './page';
import { getAllPlacesDataAction } from './acrion';

export const metadata: Metadata = {
    title: 'Pos Activation',
    description: 'Basic dashboard with Next.js and Shadcn'
};

interface PosLayoutProps {
    params: { posId: string };
}


export default async function PosLayout({ params }: PosLayoutProps) {
    const {posId} = await params;

    //check the user login or not
    const session = await auth();
    if (!session?.user) {
        return redirect('/login');
    }
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AsyncPage params={{ posId }} />
        </Suspense>
    );
}


async function AsyncPage({ params }: { params: { posId: string } }) {
    const posId = params.posId;

    const response = await getAllPlacesDataAction();

    return <PosPage posId={posId} places={response.data}/>;
}