import Image from 'next/image';
import UserSignupForm from '../(auth)/_components/user-signup-form';
import { getTranslations } from 'next-intl/server';

export default async function OnboardingPage() {
  const t = await getTranslations('onboardingRegister');
  return (
    <>
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
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;{t('onboardingText')}&rdquo;</p>
              <footer className="text-sm">{t('onboardingAuthor')}</footer>
            </blockquote>
          </div>
        </div>
        <div className="flex h-full items-center p-4 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t('createaccount')}
              </h1>
              <p className="text-sm text-muted-foreground">{t('enterbelow')}</p>
            </div>
            <UserSignupForm />
          </div>
        </div>
      </div>
    </>
  );
}
