'use client';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { updateBusinessLegalAction } from './action';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LegalPage({ businessId }: { businessId: number }) {
  const [membershipAccepted, setMembershipAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('legalPage');

  const AggreeWithTerms = async () => {
    setLoading(true);
    try {
      await updateBusinessLegalAction(
        businessId,
        termsAccepted,
        membershipAccepted
      );
      toast.success(t('successAgreeWithTerms'));
      router.push(`/`);
    } catch (error) {
      console.error(error);
      toast.error(t('errorAgreeWithTerms'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <div className="mb-8 space-y-4 text-sm">
        <p>{t('legalDescription')}</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t('condition1')}</li>
          <li>{t('condition2')}</li>
        </ul>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="membership"
            checked={membershipAccepted}
            onCheckedChange={(checked) =>
              setMembershipAccepted(checked as boolean)
            }
          />
          <label
            htmlFor="membership"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button
            disabled={loading}
            variant="outline"
            className="hover:bg-red flex-1 border-red-500 text-red-500"
            onClick={() => signOut()}
          >
            {t('cancelAndLogout')}
          </Button>

          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={!membershipAccepted || !termsAccepted || loading}
            onClick={AggreeWithTerms}
          >
            {loading ? <Loader2 className="animate-spin" /> : t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
