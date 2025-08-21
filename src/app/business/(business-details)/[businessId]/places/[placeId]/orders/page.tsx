import {
  getOrdersByPlace,
  getOrdersByPlaceCount,
  getOrdersTotalByPlace
} from '@/db/orders';
import { getPlaceById, checkUserPlaceAccess } from '@/db/places';
import { OrdersPage } from './_components/orders-page';
import { Suspense } from 'react';
import { getServiceRoleClient } from '@/db';
import Config from '@/cw/community.json';
import {
  CommunityConfig,
  ConfigToken,
  getAccountBalance
} from '@citizenwallet/sdk';
import { isAdmin } from '@/db/users';
import { getUserIdFromSessionAction } from '@/actions/session';
import { formatCurrencyNumber } from '@/lib/currency';
import PageContainer from '@/components/layout/page-container';
import { getTranslations } from 'next-intl/server';
import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import CurrencyLogo from '@/components/currency-logo';

export const metadata = {
  title: 'Place Orders'
};

interface Props {
  params: Promise<{
    businessId: string;
    placeId: string;
  }>;
  searchParams: Promise<{
    offset?: string;
    limit?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function Page(props: Props) {
  const t = await getTranslations('order');

  const community = new CommunityConfig(Config);
  const currency = community.getToken();

  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <Heading title={''} description={t('ordersFor')} />
                <div className="flex items-center gap-1 text-2xl font-bold">
                  <CurrencyLogo logo={currency.logo} size={32} />{' '}
                  <Skeleton className="h-6 w-40" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label htmlFor="dateRange" className="text-sm font-medium">
                  {t('dateRange')}
                </label>
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
          </div>
        </PageContainer>
      }
    >
      <AsyncPage {...props} />
    </Suspense>
  );
}

async function AsyncPage({ params, searchParams }: Props) {
  const client = getServiceRoleClient();
  const { businessId, placeId } = await params;
  const placeid = parseInt(placeId);

  const userId = await getUserIdFromSessionAction();

  const admin = await isAdmin(client, userId);
  if (!admin) {
    const hasPlaceAccess = await checkUserPlaceAccess(client, userId, placeid);
    if (!hasPlaceAccess) {
      throw new Error('You do not have access to this place');
    }
  }

  // Get pagination params from search params
  const {
    limit: rawLimit = '20',
    offset: rawOffset = '0',
    dateRange = 'last7days',
    startDate,
    endDate
  } = await searchParams;

  const limit = parseInt(rawLimit);
  const offset = parseInt(rawOffset);

  const [place, { data: orders }, { data: ordersTotal }, ordersCount] =
    await Promise.all([
      getPlaceById(client, placeid),
      getOrdersByPlace(
        client,
        placeid,
        limit,
        offset,
        dateRange,
        startDate,
        endDate
      ),
      getOrdersTotalByPlace(client, placeid, dateRange, startDate, endDate),
      getOrdersByPlaceCount(client, placeid, dateRange, startDate, endDate)
    ]);

  if (!place.data) {
    throw new Error('Place not found');
  }

  const community = new CommunityConfig(Config);
  const currencies = community.tokens;

  const totals = Object.values(currencies).reduce<Record<string, string>>(
    (acc, currency) => {
      const total = (ordersTotal || [])
        .filter(
          (order) =>
            place.data?.tokens.includes(order.token) &&
            order.token === currency.address
        )
        .reduce(
          (acc, order) =>
            order.status === 'correction' || order.status === 'refund'
              ? acc - order.total - order.fees
              : acc + order.total - order.fees,
          0
        );
      acc[currency.address] = formatCurrencyNumber(total, 2);
      return acc;
    },
    {}
  );

  return (
    <OrdersPage
      place={place.data}
      orders={orders || []}
      currencies={currencies}
      pagination={{
        limit,
        offset,
        totalItems: ordersCount.count || 0
      }}
      totals={totals}
    />
  );
}
