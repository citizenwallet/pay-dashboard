'use server';
import { validate } from '@/utils/zod';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { createUser } from '@/actions/createUser';
import { UserService } from '@/services/user.service';
import { getServiceRoleClient } from '@/db';
import { getBusinessByToken } from '@/db/business';
import { getUserByEmail } from '@/db/users';

const vatCheckSchema = z.object({
  token: z.string().min(8, 'Token must be at least 8 characters')
});

export async function GET(req: NextRequest) {
  const t = (await getTranslations()) as (
    key: string,
    values?: Record<string, string | number>
  ) => string;
  const searchParams = req.nextUrl.searchParams;
  const userService = new UserService();

  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      {
        status: StatusCodes.NOT_FOUND,
        message: ReasonPhrases.NOT_FOUND
      },
      {
        status: StatusCodes.NOT_FOUND
      }
    );
  }

  const result = await validate(
    vatCheckSchema,
    {
      token: token || ''
    },
    t
  );

  if (!result.success) {
    return Response.json({ errors: result });
  }

  const client = getServiceRoleClient();

  const { data: business, error } = await getBusinessByToken(client, token);

  if (error || !business) {
    return NextResponse.json(
      {
        status: StatusCodes.NOT_FOUND, // 404
        message: ReasonPhrases.NOT_FOUND // "Not Found" message
      },
      {
        status: StatusCodes.NOT_FOUND // Using the 404 constant
      }
    );
  }

  // Check if a user has been created or not

  if (business.email) {
    const { data: user, error: userError } = await getUserByEmail(
      client,
      business.email
    );

    console.log('user', user);

    if (userError || !user) {
      const userResponse = await client.auth.getUser();

      await createUser({
        email: business.email,
        linked_business_id: business.id,
        user_id: userResponse?.data?.user?.id
      });
    }
  }

  return Response.json({
    data: business,
    status: StatusCodes.OK,
    message: 'Ok'
  });
}
