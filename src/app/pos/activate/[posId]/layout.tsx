

import { Suspense } from 'react';
import PosPage from './page';
import { getAllPlacesDataAction } from './action';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';



interface PosLayoutProps {
    params: { posId: string };
}


export default async function PosLayout({ params }: PosLayoutProps) {
    const {posId} = await params;

    //check the user login or not
    const session = await auth();
    if (!session?.user) {
        return redirect('/login?redirectUrl=/pos/activate/' + posId);
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