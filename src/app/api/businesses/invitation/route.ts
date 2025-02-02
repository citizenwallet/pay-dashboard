'use server';
import { validate } from '@/utils/zod';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { BusinessService } from '@/services/business.service';
import { NextResponse } from 'next/server';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { convertBigIntToString } from '@/lib/utils';
import { createUser } from '@/actions/createUser';
import { UserService } from '@/services/user.service';
import { createClient } from '@/lib/supabase/server';

const vatCheckSchema = z.object({
  token: z.string().min(8, 'Token must be at least 8 characters')
});

export async function GET(req: NextRequest) {
  const t = await getTranslations();
  const searchParams = req.nextUrl.searchParams;
  const service = new BusinessService();
  const userService = new UserService();
  const token = searchParams.get('token');
  const supabase = await createClient();

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
    t as any
  );

  if (!result.success) {
    return Response.json({ errors: result });
  }

  const business = await service.getBusinessByToken(
    searchParams.get('token') || ''
  );

  if (!business) {
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
    const userResponse = await supabase.auth.getUser();
    const user = await userService.getUserByEmail(business.email);

    console.log('user', user);

    if (!user) {
      await createUser({
        email: business.email,
        linked_business_id: business.id,
        user_id: userResponse?.data?.user?.id
      });
    }
  }

  return Response.json(
    convertBigIntToString({
      data: business,
      status: StatusCodes.OK,
      message: 'Ok'
    })
  );
}
