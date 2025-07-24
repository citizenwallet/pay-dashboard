
import { auth } from '@/auth';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { getServiceRoleClient } from '@/db';
import { getBusinessById } from '@/db/business';
import { isOwnerOfBusiness } from '@/db/businessUser';
import { isAdmin } from '@/db/users';
import { Separator } from '@radix-ui/react-separator';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import BusinessEdit from './businessUpdate';
import Fallback from './fallback';

export default async function page({
    params
}: {
    params: Promise<{ businessId: string; placeId: string }>;
}) {
    const resolvedParams = await params;
    const businessId = resolvedParams.businessId;
    const placeId = resolvedParams.placeId;

    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }
    const t = await getTranslations('business');

    return (
        <>
            <div>
                <PageContainer>
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <Heading title={t('businessDetails')} description={t('businessDetailsDescription')} />
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-4 overflow-y-auto">
                            <Suspense fallback={<Fallback />}>
                                <AsyncPage
                                    businessId={businessId}
                                    userId={session?.user?.id}
                                    placeId={placeId}
                                />
                            </Suspense>
                        </div>
                    </div>
                </PageContainer>
            </div>
        </>
    )
}

async function AsyncPage({
    businessId,
    userId,
    placeId
}: {
    businessId: string;
    userId: string;
    placeId: string;
}) {
    const client = getServiceRoleClient();
    const admin = await isAdmin(client, parseInt(userId));

    if (!admin) {
        const isOwner = await isOwnerOfBusiness(
            client,
            parseInt(userId),
            Number(businessId)
        );
        if (!isOwner) {
            redirect(`/business/${businessId}/places/${placeId}/profile`);
        }
    }

    const { data: business } = await getBusinessById(client, Number(businessId));

    if (!business) {
        return <div>Business not found</div>;
    }

    return <BusinessEdit
        business={business}
        userId={parseInt(userId)}
        placeId={Number(placeId)}
    />;
}
