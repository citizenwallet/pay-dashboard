import { isUserAdminAction } from '@/actions/session';
import { Suspense } from 'react';
import { getLinkedBusinessAction } from '../(business-details)/[businessId]/action';
import BusinessCard from './business-card';
import { getAllBusinessAction } from './action';

export default function BusinessPage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
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
