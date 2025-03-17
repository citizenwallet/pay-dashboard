'use client';
import { CompanyOnboarding } from '@/components/onboarding';
import { useSearchParams } from 'next/navigation';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  //same time otpToken not have in url,in that case otpToken is null
  const otpToken = searchParams.get('otpToken');
  const vat_number = searchParams.get('vat_number');
  const token = searchParams.get('invite_code');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <CompanyOnboarding
        otpToken={otpToken}
        vat_number={vat_number}
        token={token}
      />
    </div>
  );
}
