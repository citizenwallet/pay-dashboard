'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { verifyVAT } from '@/utils/vat';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CompanyInfo } from '@/components/onboarding/types';
import { ButtonLoading } from '@/components/ui/button-loading';

const vatSchema = z.object({
  vat_number: z.string().min(8, 'VAT is required')
});

type VATStepProps = {
  onNext: (data: CompanyInfo) => void;
  initialData?: CompanyInfo;
};

export function CompanyVATStep({ onNext, initialData }: VATStepProps) {
  const t = useTranslations('Common');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm({
    resolver: zodResolver(vatSchema),
    defaultValues: initialData
  });

  const onSubmit = async (data: CompanyInfo) => {
    setLoading(true);
    const isValid = await verifyVAT(data.vat_number);

    if (isValid) {
      const response = await fetch(`/api/vat?vat=${data.vat_number}`);

      // if (!response.ok) {
      //   setError('vat_number', {
      //     type: 'manual',
      //     message: 'Invalid VAT number'
      //   });
      //   return;
      // }

      const result = await response.json();

      if (result.isValid) {
        data.address_legal = result.address.replace(/\n/g, ', ');
        data.legal_name = result.name;
      }
    }
    onNext(data);

    setLoading(false);
  };

  useEffect(() => {
    if (initialData) {
      setValue('vat_number', initialData.vat_number);
    }
  }, [initialData, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-black">
      <h1 className="mb-6 text-2xl font-bold">{t('Welcome')}</h1>
      <div>{t('VAT mandatory message')}</div>
      <div>
        <Input
          placeholder={'EX: BE0790756234'}
          id="vat"
          {...register('vat_number')}
        />
        {errors.vat_number && (
          <p className="mt-1 text-sm text-red-500">
            {errors.vat_number.message}
          </p>
        )}
      </div>
      <ButtonLoading loading={loading} type="submit">
        {t('Next')}
      </ButtonLoading>
    </form>
  );
}
