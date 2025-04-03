'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { checkIsUseraction, sendOtpAction } from '../action';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const t = useTranslations('onboardingLogin');
  const searchParams = useSearchParams();
  const [mailSent, setMailSent] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const defaultValues = {
    email: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  const router = useRouter();

  const onSubmit = async (userData: UserFormValue) => {
    startTransition(async () => {
      const data = await checkIsUseraction(userData.email);
      if (data) {
        //user already signing so ,otp send
        try {
          const res = await sendOtpAction(userData.email);
          if (res) {
            setMailSent(true);
            //use local storage for store email
            localStorage.setItem('otpEmail', userData.email);
            //then should go to otp page
            router.push('/otp');
          }
        } catch (error) {
          toast.error(t('errorLoggingIn'));
        }
      } else {
        toast.error(t('emailNotRegistered'));
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel title={'Email'} />
                <FormControl>
                  <Input
                    className="text-base"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto w-full" type="submit">
            {t('signin')}
          </Button>

          <div className="flex justify-center">
            <a href="/onboarding" className="text-sm text-primary">
              {t('havenotAccount')}
            </a>
          </div>
        </form>
      </Form>
    </>
  );
}
