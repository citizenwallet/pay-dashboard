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
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { generateRandomString } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/phone-input';
import Link from 'next/link';
import { sendOtpAction } from '../action';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  name: z.string(),
  phone: z.string()
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserSignupForm() {
  const t = useTranslations('onboardingRegister');
  const [loading, startTransition] = useTransition();
  const defaultValues = {};
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (credentials: UserFormValue) => {
    try {
      startTransition(async () => {
        const res = await sendOtpAction(credentials.email);
        localStorage.setItem('otpEmail', credentials.email);
        localStorage.setItem('regName', credentials.name);
        localStorage.setItem('regPhone', credentials.phone);

        window.location.href = '/otp';
      });
    } catch (e) {
      console.error(e);
      toast.error('An error occurred while signing up');
    }
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    type="text"
                    placeholder={t('namePlaceholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PhoneInput defaultCountry="BE" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
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
            {t('signup')}
          </Button>

          <div className="mt-2 flex justify-center">
            <Link href="/login">{t('alreadyHaveAccount')}</Link>
          </div>
        </form>
      </Form>
    </>
  );
}
