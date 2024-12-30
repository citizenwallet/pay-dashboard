import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import {StatusCodes} from 'http-status-codes';
import { faker } from '@faker-js/faker';
import { UserService } from '@/services/user.service';

export async function GET() {

  const fakeNumber: number = faker.number.int();

  const session = await auth();

  if(!session?.user) {
    return Response.redirect('/');
  }

  return Response.json({
    total: fakeNumber
  });
}
