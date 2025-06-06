import { Metadata } from 'next';
import Link from 'next/link';
import UserAuthForm from './user-auth-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import UserSignupForm from '@/app/(auth)/_components/user-signup-form';
import Image from 'next/image';
export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function RegisterView() {
  const t = useTranslations();

  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            className="mr-2 h-6 w-6"
            src="/assets/img/logo.svg"
            alt="Logo"
            width={40}
            height={40}
          />{' '}
          {t('Common.Brussels Pay')}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Money is not the only currency. Your time, your energy,
              your heart are also currencies. Neighborhoods and communities can
              create new sources of capital: respect, trust, reciprocity.&rdquo;
            </p>
            <footer className="text-sm">
              Edgar Cahn - Creator of the TimeBanking
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to register
            </p>
          </div>
          <UserSignupForm />
        </div>
      </div>
    </div>
  );
}
