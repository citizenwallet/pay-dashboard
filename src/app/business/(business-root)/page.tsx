import { isUserAdminAction } from '@/actions/session';
import { Business } from '@/db/business';
import { Suspense } from 'react';
import { getLinkedBusinessAction } from '../(business-details)/[businessId]/places/[placeId]/action';
import BusinessTable from './_table/business-table';
import { placeholderData, skeletonColumns } from './_table/columns';
import { getAllBusinessAction } from './action';
import { DataTable } from '@/components/ui/data-table';


export default function BusinessPage() {
  return (
    <>

      <Suspense fallback={<DataTable columns={skeletonColumns} data={placeholderData} />}>
        {asyncBusinessPage()}
      </Suspense>

    </>
  );
}

const asyncBusinessPage = async () => {
  const admin = await isUserAdminAction();
  let businesses: Business[] | null = null;


  if (admin) {
    businesses = await getAllBusinessAction();


  } else {
    const business = await getLinkedBusinessAction();
    businesses = business ? [business] : null;

  }


  return <BusinessTable businesses={businesses ?? []} />;
};

