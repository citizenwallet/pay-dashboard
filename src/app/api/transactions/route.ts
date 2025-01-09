import '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from '@/types/transaction';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const session = await auth();

  if (!session?.user) {
    return Response.redirect('/');
  }

  const user = await prisma.users.findFirst({
    where: {
      email: session.user.email
    }
  });

  if (!user) {
    return Response.json({
      error: 'User not found',
      status: StatusCodes.NOT_FOUND
    });
  }

  // Find businesses that the user has access to
  const businesses = await prisma.businesses.findFirst({
    where: {
      id: user.linked_business_id as any
    }
  });

  if (!businesses) {
    return Response.json({
      error: 'Business not found',
      status: StatusCodes.NOT_FOUND
    });
  }

  const places = await prisma.places.findMany({
    where: {
      business_id: businesses.id as any
    }
  });

  // @ts-ignore
  const placesIds: any[] = [];

  // @ts-ignore
  places.map(
    // @ts-ignore
    (place) => place?.accounts?.map((account) => placesIds.push(account))
  );

  const data = await prisma.a_transactions.findMany({
    where: {
      from: {
        in: placesIds
      }
    }
  });

  const accountsIdsTo = data.map((transaction) => transaction.to);
  const accountsIdsFrom = data.map((transaction) => transaction.from);
  const accountsIds = [...accountsIdsTo, ...accountsIdsFrom];

  const accounts = await prisma.a_profiles.findMany({
    where: {
      account: {
        in: accountsIds
      }
    }
  });

  const dataComputed = data.map((transaction) => {
    const from = accounts.find(
      (account) => account.account === transaction.from
    );
    const to = accounts.find((account) => account.account === transaction.to);

    return {
      ...transaction,
      from: from,
      to: to
    };
  });

  if (query.has('export')) {
    console.log('Exporting transactions');
    // @ts-ignore
    const csv = data
      .map((transaction: any) => {
        // @ts-ignore
        return `${transaction.id},${transaction.from?.account},${transaction.to?.account},${transaction.amount},${transaction.description},${transaction.created_at}\n`;
      })
      .join('');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=transactions.csv'
      }
    });
  }

  return Response.json({ data: dataComputed });
}
