'use client';

import { useState, useEffect, useMemo } from 'react';
import { Order } from '@/db/orders';
import { Profile } from '@citizenwallet/sdk';
import { formatCurrencyNumber } from '@/lib/currency';
import CurrencyLogo from '@/components/currency-logo';
import { Item } from '@/db/items';
import Image from 'next/image';
import { getOrderByPlaceAction } from '@/app/actions/getOrderByPlace';
import { Place } from '@/db/places';
import { getAccountBalanceAction } from '@/cw/balance';
import { AProfile } from '@/db/profiles';
import { loadProfileMapFromHashesAction } from '@/app/actions/loadProfileMapFromHashes';
import { OrderCard } from './Order';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListChecks, QrCode } from 'lucide-react';
import Pay from './Pay';

const MAX_ORDERS = 20;

interface VendorOrdersProps {
  initialOrders?: Order[];
  items?: { [key: number]: Item };
  accountOrUsername?: string;
  placeId?: number;
  place?: Place | null;
  profile?: Profile | null;
  initialProfiles?: { [key: string]: AProfile };
  initialBalance?: number;
  currencyLogo?: string;
  loading?: boolean;
}

export default function VendorOrders({
  initialOrders = [],
  items = {},
  accountOrUsername,
  placeId,
  place,
  profile,
  initialProfiles = {},
  initialBalance = 0,
  currencyLogo,
  loading = false
}: VendorOrdersProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [profiles, setProfiles] = useState<{ [key: string]: AProfile }>(
    initialProfiles
  );
  const [balance, setBalance] = useState<number>(initialBalance);

  useEffect(() => {
    if (!place || !place.accounts[0]) return;

    const interval = setInterval(() => {
      getAccountBalanceAction(place.accounts[0] ?? '').then((balance) => {
        setBalance(Number(balance ?? 0));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [place]);

  useEffect(() => {
    if (!placeId) return;

    const interval = setInterval(() => {
      getOrderByPlaceAction(placeId, MAX_ORDERS, 0).then(({ data }) => {
        if (!data) return;

        loadProfileMapFromHashesAction(
          data
            .filter((order) => order.tx_hash != null && order.tx_hash != '')
            .map((order) => order.tx_hash!)
        ).then((newProfiles) => {
          setProfiles(newProfiles);
        });

        // TODO: Add pagination
        setOrders(data);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [placeId]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="mx-auto flex w-full max-w-md flex-grow flex-col bg-white shadow-xl">
        <header className="sticky top-0 z-10 bg-slate-900 p-4 text-white">
          <div className="flex items-center gap-4">
            {loading && (
              <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
            )}
            {!loading && (
              <Image
                src={profile?.image ?? place?.image ?? '/shop.png'}
                alt={profile?.name ?? place?.name ?? 'Shop'}
                width={80}
                height={80}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            {loading && (
              <div>
                <div className="h-8 w-32 animate-pulse rounded-md bg-gray-200" />
                <div className="h-5 w-48 animate-pulse rounded-md bg-gray-200" />
              </div>
            )}
            {!loading && (
              <div>
                <h1 className="text-2xl font-bold">
                  {profile?.name ?? place?.name ?? 'Shop'}
                </h1>
                <p className="text-sm opacity-90">
                  {profile?.description ?? ''}
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-col p-4 pb-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Balance</h2>
            <div className="flex items-center gap-2">
              <CurrencyLogo logo={currencyLogo} size={18} />
              <p className="text-lg font-bold">
                {formatCurrencyNumber(balance)}
              </p>
            </div>
          </div>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="h-10 w-full">
              <TabsTrigger value="orders" className="w-full text-lg">
                <ListChecks className="mr-2 h-4 w-4" /> Orders
              </TabsTrigger>
              <TabsTrigger value="pay" className="w-full text-lg">
                <QrCode className="mr-2 h-4 w-4" /> Pay
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              {loading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="mb-4 h-[200px] w-full animate-pulse rounded-md bg-gray-200"
                  />
                ))}
              {!loading && orders.length === 0 && (
                <div className="text-center text-gray-500">No orders yet</div>
              )}
              {!loading &&
                orders.map((order) => {
                  const orderProfile = order.tx_hash
                    ? profiles?.[order.tx_hash]
                    : null;

                  return (
                    <OrderCard
                      key={order.id}
                      order={order}
                      orderProfile={orderProfile}
                      items={items}
                      currencyLogo={currencyLogo}
                    />
                  );
                })}
              {!loading && orders.length >= MAX_ORDERS && (
                <div className="text-center text-gray-500">
                  Showing latest orders
                </div>
              )}
              {!loading && orders.length < MAX_ORDERS && orders.length > 0 && (
                <div className="text-center text-gray-500">No more orders</div>
              )}
            </TabsContent>
            <TabsContent value="pay" className="flex w-full">
              {useMemo(
                () => (
                  <Pay
                    baseUrl={`${
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : ''
                    }/${accountOrUsername}`}
                    placeId={placeId}
                    currencyLogo={currencyLogo}
                  />
                ),
                [accountOrUsername, placeId, currencyLogo]
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
