import { isUserAdminAction } from '@/actions/session';
import { Suspense } from 'react';
import { getLinkedBusinessAction } from '../(business-details)/[businessId]/places/[placeId]/action';
import BusinessCard from './business-card';
import { getAllBusinessAction, getBusinessBalanceAction } from './action';
import { SkeletonCard } from '@/components/skeleton-card';
import Config from '@/cw/community.json';
import { CommunityConfig, getAccountBalance } from '@citizenwallet/sdk';

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

  const community = new CommunityConfig(Config);
  const currencyLogo = community.community.logo;
  const tokenDecimals = community.primaryToken.decimals;

  if (admin) {
    const businesses = await getAllBusinessAction();
    const businessesWithBalance = await Promise.all(
      businesses?.map(async (business) => {
        const balance = await getBusinessBalanceAction(business.id, community);
        return { ...business, balance };
      }) ?? []
    );
    return (
      <BusinessCard
        business={businessesWithBalance}
        currencyLogo={currencyLogo}
        tokenDecimals={tokenDecimals}
      />
    );
  } else {
    const business = await getLinkedBusinessAction();
    if (!business) {
      return null;
    }
    const balance = await getBusinessBalanceAction(business.id, community);
    const businessWithBalance = { ...business, balance };

    return (
      <BusinessCard
        business={[businessWithBalance]}
        currencyLogo={currencyLogo}
        tokenDecimals={tokenDecimals}
      />
    );
  }
};
