'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Business } from '@/db/business';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBusinessDetailsAction } from '../action';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function DetailsPage({
  company,
  business
}: {
  company: any;
  business: Business;
}) {
  const [legalName, setLegalName] = useState(business.legal_name || '');
  const [address, setAddress] = useState(business.address_legal || '');
  const [iban, setIban] = useState(business.iban_number || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    legalName: '',
    address: '',
    iban: '',
    terms: ''
  });
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isMembershipAccepted, setIsMembershipAccepted] = useState(false);

  const router = useRouter();
  const t = useTranslations('onboardingDetails');

  useEffect(() => {
    if (company?.isValid) {
      setLegalName(company.name || '');
      setAddress(company.address || '');
    }
  }, [company]);

  const handleSubmit = async () => {
    setErrors({ legalName: '', address: '', iban: '', terms: '' });
    let hasError = false;
    const newErrors = { legalName: '', address: '', iban: '', terms: '' };

    if (!legalName.trim()) {
      newErrors.legalName = t('legalNameRequired');
      hasError = true;
    }
    if (!address.trim()) {
      newErrors.address = t('addressRequired');
      hasError = true;
    }
    if (!iban.trim()) {
      newErrors.iban = t('ibanRequired');
      hasError = true;
    }

    if (!isTermsAccepted || !isMembershipAccepted) {
      newErrors.terms = 'You must accept the agreements';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await updateBusinessDetailsAction(
        business.id,
        legalName,
        address,
        iban,
        isTermsAccepted,
        isMembershipAccepted
      );
      toast.success(t('yourBusinessHasBeen'), {
        onAutoClose: () => {
          router.push(`/`);
        }
      });
    } catch (error) {
      toast.error(t('errorUpdatingBusiness'));
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = async () => {
    await router.push(`/onboarding/vat?invite_code=${business.invite_code}`);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-900">
          {t('legalName')}
        </Label>
        <Input
          type="text"
          className="h-8 rounded-md border border-black px-4 text-base text-black"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          disabled={loading}
        />
        {errors.legalName && (
          <p className="text-sm text-red-500">{errors.legalName}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-900">
          {t('address')}
        </Label>
        <Input
          type="text"
          className="h-8 rounded-md border border-black px-4 text-base text-black"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={loading}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-900">{t('iban')}</Label>
        <Input
          type="text"
          className="h-8 rounded-md border border-black px-4 text-base text-black"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          disabled={loading}
        />
        {errors.iban && <p className="text-sm text-red-500">{errors.iban}</p>}
      </div>

      <div className="mt-6 flex items-center space-x-2">
        <Checkbox
          id="terms2"
          className="border-black text-black"
          checked={isMembershipAccepted}
          onCheckedChange={() => setIsMembershipAccepted(!isMembershipAccepted)}
        />
        <label
          htmlFor="terms2"
          className="text-sm font-medium leading-none text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('membershipAgreement')}{' '}
          <>
            <Link
              href="/legal/membership-agreement-fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              (French)
            </Link>
            {'  |  '}
            <Link
              href="/legal/membership-agreement-nl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              (Dutch)
            </Link>
          </>
        </label>
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <Checkbox
          id="terms2"
          className="border-black text-black"
          checked={isTermsAccepted}
          onCheckedChange={() => setIsTermsAccepted(!isTermsAccepted)}
        />
        <label
          htmlFor="terms2"
          className="text-sm font-medium leading-none text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('termsAndConditions')}
          {'  '}

          <>
            <Link
              href="/legal/terms-and-conditions-fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              (French)
            </Link>
            {'  |  '}
            <Link
              href="/legal/terms-and-conditions-nl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              (Dutch)
            </Link>
          </>
        </label>
      </div>

      <p className="mt-4 text-sm text-red-500">{errors.terms}</p>

      <div className="mt-6 flex justify-between">
        <Button
          className="h-10 w-24 rounded-md border border-black bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200"
          disabled={loading}
          onClick={handlePrevious}
        >
          {t('previous')}
        </Button>

        <Button
          className="h-10 w-24 rounded-md bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? t('submitting') : t('submit')}
        </Button>
      </div>
    </div>
  );
}
