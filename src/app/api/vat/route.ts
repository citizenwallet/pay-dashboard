'use server';
import { validate } from '@/utils/zod';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { StatusCodes } from 'http-status-codes';
import { fetchCompanyForVatNumber } from '@/services/vat';

const vatCheckSchema = z.object({
  vat: z
    .string()
    .min(8, 'VAT number must be at least 8 characters')
    .max(12, 'VAT number must be at most 12 characters')
});

export async function GET(req: NextRequest) {
  const t = await getTranslations();
  const searchParams = req.nextUrl.searchParams;

  const result = await validate(
    vatCheckSchema,
    {
      vat: searchParams.get('vat') || ''
    },
    t as (key: string, values?: Record<string, string | number>) => string
  );

  if (!result.success) {
    return Response.json({ errors: result, status: StatusCodes.BAD_REQUEST });
  }

  const vat = searchParams.get('vat') || '';

  const data = await fetchCompanyForVatNumber(vat);

  return Response.json(data);
}
