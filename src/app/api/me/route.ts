// Generate transactions for a user
import { NextResponse } from 'next/server';

export async function PUT() {
  return NextResponse.json({
    message: 'Hello, world!'
  });
  //   const session = await auth();
  //   const body: any = await request.json();

  //   if (!session?.user) {
  //     return Response.redirect('/');
  //   }

  //   const user = await prisma.users.findFirst({
  //     where: {
  //       email: session.user.email
  //     }
  //   });

  //   if (!user) {
  //     return Response.json({
  //       error: 'User not found',
  //       status: StatusCodes.NOT_FOUND
  //     });
  //   }

  //   const res = await prisma.users.update({
  //     where: {
  //       id: user.id
  //     },
  //     data: {
  //       ...(body as any)
  //     }
  //   });

  //   console.log(res, {
  //     ...(body as any)
  //   });

  //   if (!user) {
  //     return Response.json({
  //       error: 'User not found',
  //       status: StatusCodes.NOT_FOUND
  //     });
  //   } else {
  //     return Response.json({ user });
  //   }
  // }

  // export async function GET() {
  //   const session = await auth();

  //   if (!session?.user) {
  //     return Response.redirect('/');
  //   }

  //   const user = await prisma.users.findFirst({
  //     where: {
  //       email: session.user.email
  //     }
  //   });

  //   if (!user) {
  //     return Response.json({
  //       error: 'User not found',
  //       status: StatusCodes.NOT_FOUND
  //     });
  //   }

  //   if (!user.linked_business_id) {
  //     const inviteCode = uuidv4();
  //     await joinAction(inviteCode, {
  //       email: session.user.email as string,
  //       name: session.user.name || '',
  //       phone: '',
  //       description: '',
  //       image: ''
  //     });
  //   }

  //   // Find businesses that the user has access to
  //   const businesses = await prisma.businesses.findFirst({
  //     where: {
  //       id: user.linked_business_id as any
  //     }
  //   });

  //   if (!businesses) {
  //     return Response.json({
  //       error: 'Business not found',
  //       status: StatusCodes.NOT_FOUND
  //     });
  //   }

  //   const places = await prisma.places.findMany({
  //     where: {
  //       business_id: businesses.id as any
  //     }
  //   });

  //   const placesIds: string[] = [];

  //   for (const place of places) {
  //     if (place?.accounts) {
  //       for (const account of place.accounts as string[]) {
  //         placesIds.push(account);
  //       }
  //     }
  //   }

  //   return Response.json({
  //     places,
  //     user,
  //     business: businesses,
  //     accounts: placesIds
  //   });
}
