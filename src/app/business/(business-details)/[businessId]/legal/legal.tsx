'use client';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { updateBusinessLegalAction } from './action';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import { FileIcon, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Business } from '@/db/business';
import { Separator } from '@/components/ui/separator';

export default function LegalPage({
  businessId,
  business
}: {
  businessId: number;
  business: Business;
}) {
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
    <div className="flex max-w-2xl flex-col items-center p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <div className="mb-8 space-y-4 text-sm">
        <p>{t('between')}</p>
        <div className="flex flex-col gap-2 pl-4">
          <p>{business.legal_name}</p>
          <p>{business.address_legal}</p>
          <p>{business.vat_number}</p>
        </div>
        <p>{t('and')}</p>
        <div className="flex flex-col gap-2 pl-4">
          <p>{t('entityName')}</p>
          <p>{t('entityAddress')}</p>
          <p>{t('entityVatNumber')}</p>
        </div>
        <Separator className="my-4" />
        <p>{t('description')}</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t('condition1')}</li>
          <li>{t('condition2')}</li>
          <li>{t('condition3')}</li>
          <li>{t('condition4')}</li>
        </ul>
        <p>{t('description2')}</p>
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
            className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('membershipAgreement')}{' '}
            <>
              <Link
                href="/legal/membership-agreement-fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 hover:bg-primary/20"
              >
                (FR) <FileIcon className="h-4 w-4" />
              </Link>
              {'  |  '}
              <Link
                href="/legal/membership-agreement-nl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 hover:bg-primary/20"
              >
                (NL) <FileIcon className="h-4 w-4" />
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
            className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('termsAndConditions')}
            {'  '}

            <>
              <Link
                href="/legal/terms-and-conditions-fr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 hover:bg-primary/20"
              >
                (FR) <FileIcon className="h-4 w-4" />
              </Link>
              {'  |  '}
              <Link
                href="/legal/terms-and-conditions-nl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 hover:bg-primary/20"
              >
                (NL) <FileIcon className="h-4 w-4" />
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
