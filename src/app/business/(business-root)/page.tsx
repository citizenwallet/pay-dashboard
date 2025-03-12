import { isUserAdminAction } from '@/actions/session';
import { Suspense } from 'react';
import { getLinkedBusinessAction } from '../(business-details)/[businessId]/action';
import BusinessCard from './business-card';
import { getAllBusinessAction } from './action';
import { SkeletonCard } from '@/components/skeleton-card';

export default function BusinessPage() {
  return (
    <>
      <Suspense fallback={<SkeletonCard count={4} />}>
        {asyncBusinessPage()}
      </Suspense>
    </>
  );
}

const asyncBusinessPage = async () => {
  const admin = await isUserAdminAction();

  if (admin) {
    const businesses = await getAllBusinessAction();
    return <BusinessCard business={businesses} />;
  } else {
    const business = await getLinkedBusinessAction();
    if (!business) {
      return null;
    }
    return <BusinessCard business={[business]} />;
  }
};
