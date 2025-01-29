'use server';
import { validate } from '@/utils/zod';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { convertBigIntToString } from '@/lib/utils';

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
    t as any
  );

  if (!result.success) {
    return Response.json({ errors: result });
  }

  const vat = searchParams.get('vat') || '';
  const vatNumber = vat.replace(/[^0-9]/g, '');
  const countryCode = vat.slice(0, 2);

  const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumber}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data: any = await response.json();

  return Response.json(convertBigIntToString(data));
}
