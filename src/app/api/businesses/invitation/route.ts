'use server';
import { validate } from '@/utils/zod';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { BusinessService } from '@/services/business.service';
import { NextResponse } from "next/server";
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

const vatCheckSchema = z.object({
  token: z.string().min(8, "Token must be at least 8 characters"),
});

export async function GET(req: NextRequest) {
  const t = await getTranslations();
  const searchParams = req.nextUrl.searchParams;
  const service = new BusinessService();

  const result = await validate(vatCheckSchema, {
    token: searchParams.get('token') || '',
  }, t as any);

  if(!result.success){
    return Response.json({ errors: result});
  }

  const business = await service.getBusinessByToken(searchParams.get('token') || '');

  if(!business){
    return NextResponse.json(
      {
        status: StatusCodes.NOT_FOUND, // 404
        message: ReasonPhrases.NOT_FOUND, // "Not Found" message
      },
      {
        status: StatusCodes.NOT_FOUND, // Using the 404 constant
      }
    );
  }

  return Response.json({
    data: business,
    status: StatusCodes.OK,
    message: "Ok"
  });
}
