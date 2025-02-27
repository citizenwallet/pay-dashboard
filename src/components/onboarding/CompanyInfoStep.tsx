'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { companySchema } from './types';
import { useEffect } from 'react';
import { ButtonLoading } from '@/components/ui/button-loading';

const companyInfoSchema = companySchema;

type CompanyInfoStepProps = {
  onNext: (data: z.infer<typeof companyInfoSchema>) => void;
  onPrev: () => void;
  initialData?: z.infer<typeof companyInfoSchema>;
  loading: boolean;
};

export function CompanyInfoStep({
  onNext,
  onPrev,
  initialData,
  loading
}: CompanyInfoStepProps) {
  const t = useTranslations('Common');
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: initialData
  });

  useEffect(() => {
    if (initialData) {
      setValue('iban_number', initialData.iban_number);
      setValue('legal_name', initialData.legal_name);
      setValue('address_legal', initialData.address_legal);
      setValue('website', initialData.website);
    }
  }, [initialData, register, setValue]);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h1 className="mb-6 text-2xl font-bold">
        {t('Need more infos to complete the account creation')}
      </h1>
      <div>
        <Label htmlFor="legal_name">{t('Legal Name')}</Label>
        <Input id="legal_name" {...register('legal_name')} />
        {errors.legal_name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.legal_name.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="address_legal">{t('Address')}</Label>
        <Input id="address_legal" {...register('address_legal')} />
        {errors.address_legal && (
          <p className="mt-1 text-sm text-red-500">
            {errors.address_legal.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="iban_number">{t('IBAN')}</Label>
        <Input id="iban_number" {...register('iban_number')} />
        {errors.iban_number && (
          <p className="mt-1 text-sm text-red-500">
            {errors.iban_number.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="website">{t('Website')}</Label>
        <Input id="website" {...register('website')} />
        {errors.website && (
          <p className="mt-1 text-sm text-red-500">{errors.website.message}</p>
        )}
      </div>
      <div className="flex justify-between">
        <Button type="button" onClick={onPrev} variant="outline">
          {t('Previous')}
        </Button>
        <ButtonLoading loading={loading} type="submit">
          {t('Next')}
        </ButtonLoading>
      </div>
    </form>
  );
}
