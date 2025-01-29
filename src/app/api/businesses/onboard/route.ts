'use server';
import { NextRequest } from 'next/server';
import { BusinessService } from '@/services/business.service';
import { NextResponse } from 'next/server';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import '@/lib/utils';
import { convertBigIntToString } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const formData = await req.json();
  const token = formData.token;

  const businessService = new BusinessService();

  if (!token) {
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

  const business = await businessService.getBusinessByToken(token as string);

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

  delete formData.token;
  delete formData.id;

  const response = await businessService.updateBusiness(business.id, formData);

  return NextResponse.json(
    convertBigIntToString({
      data: response,
      status: StatusCodes.OK
    })
  );
}
