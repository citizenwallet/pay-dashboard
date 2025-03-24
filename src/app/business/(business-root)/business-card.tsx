import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Business } from '@/db/business';
import { Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function BusinessCard({
  business
}: {
  business: Business[] | null;
}) {
  return (
    <div className="mx-6 mt-6 space-y-4">
      <div className="h-[calc(100vh-150px)] space-y-4 overflow-y-auto pr-2">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {business?.map((business) => (
            <Link href={`/business/${business.id}`} key={business.id}>
              <Card className="transition-shadow duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {business.vat_number}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{business.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
