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
      newErrors.legalName = 'Legal name is required';
      hasError = true;
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
      hasError = true;
    }
    if (!iban.trim()) {
      newErrors.iban = 'IBAN is required';
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
      toast.success('Your business has been successfully validated !', {
        onAutoClose: () => {
          router.push(`/`);
        }
      });
    } catch (error) {
      toast.error(
        'Oops, there is an error during the validation of your company'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = async () => {
    await router.push(`/onboarding/vat?invite_code=${business.invite_code}`);
  };

  return (
    <div className="mt-8">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Legal name</Label>
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

      <div className="mt-4 space-y-2">
        <Label className="text-sm font-medium text-gray-900">Address</Label>
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

      <div className="mt-4 space-y-2">
        <Label className="text-sm font-medium text-gray-900">IBAN</Label>
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
          <Link
            href="/legal/membership-agreement-fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Accept Membership Agreement
          </Link>
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
          <Link
            href="/legal/terms-and-conditions-fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Accept Terms and Conditions
          </Link>
        </label>
      </div>

      <p className="mt-4 text-sm text-red-500">{errors.terms}</p>

      <div className="mt-6 flex justify-between">
        <Button
          className="h-10 w-24 rounded-md border border-black bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200"
          disabled={loading}
          onClick={handlePrevious}
        >
          Previous
        </Button>

        <Button
          className="h-10 w-24 rounded-md bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
