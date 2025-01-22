'use client';

import { useEffect, useState, useRef } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Order } from '@/db/orders';
import { Item } from '@/db/items';
import { formatCurrencyNumber } from '@/lib/currency';
import CurrencyLogo from '@/components/currency-logo';
import { useRouter } from 'next/navigation';
import { getOrderStatus } from '@/app/actions/getOrderStatuts';
import { format } from 'date-fns';

interface Props {
  accountOrUsername: string;
  order: Order;
  items: { [key: number]: Item };
  currencyLogo: string;
  tx?: string;
  close?: string;
}

export default function Component({
  accountOrUsername,
  order,
  items,
  currencyLogo,
  tx,
  close
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Order['status']>(order.status);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getStatus = async () => {
      const { data, error } = await getOrderStatus(order.id);
      if (error) {
        console.error(error);
      } else {
        setStatus(data?.status ?? 'pending');
      }
    };

    intervalRef.current = setInterval(getStatus, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [order.id]);

  useEffect(() => {
    if (status === 'paid') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (close) {
        setTimeout(() => {
          router.push(close);
        }, 10000);
      }
    }
  }, [status, close, router]);

  const handleOrderAgain = () => {
    router.push(`/${accountOrUsername}`);
  };

  const handleClose = () => {
    if (close) {
      router.push(close);
    }
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
            {status === 'paid' ? 'Order Confirmed' : 'Order Pending'}{' '}
            {status === 'pending' && <Loader2 className="animate-spin" />}
          </CardTitle>
          {status === 'paid' && (
            <div className="mt-2 flex items-center justify-center text-green-600">
              <Check className="mr-2 h-6 w-6" />
              <span>Thank you for your order!</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Order ID:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Date:</span>
              <span>
                {order.completed_at
                  ? format(new Date(order.completed_at), 'MMM d, yyyy HH:mm')
                  : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total:</span>
              <span className="flex items-center gap-2 font-semibold">
                <CurrencyLogo logo={currencyLogo} size={20} />
                {formatCurrencyNumber(order.total)}
              </span>
            </div>
          </div>
          {order.description && (
            <div className="mt-6 flex items-center justify-between space-y-2 rounded-lg bg-gray-200 p-2">
              <span>{order.description}</span>
            </div>
          )}
          {order.items.length > 0 && (
            <div className="mt-6">
              <div className="mt-4 space-y-2 rounded-lg bg-gray-200 p-2">
                {order.items.map((item) => {
                  const itemData = items[item.id];
                  if (!itemData) return null;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {itemData.name} x{item.quantity}
                      </span>
                      <span className="flex items-center gap-2">
                        <CurrencyLogo logo={currencyLogo} size={20} />
                        {formatCurrencyNumber(itemData.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Please show this to the vendor
          </p>
        </CardFooter>
      </Card>
      <div className="mt-4 flex justify-center">
        {!tx && (
          <Button className="h-14 text-lg" onClick={handleOrderAgain}>
            Order again
          </Button>
        )}
        {tx && close && (
          <Button className="h-14 text-lg" onClick={handleClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
