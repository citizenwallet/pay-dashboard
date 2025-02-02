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

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
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

  const onSubmit = async (userData: UserFormValue) => {
    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_URL
        }
      });

      if (error) {
        console.error(error);
        toast.error('An error occurred while signing in');
        setMailSent(false);
        return;
      } else {
        window.location.href = '/sent';
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
                    type="email"
                    placeholder="Enter your email..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto w-full" type="submit">
            Sign in
          </Button>

          <div className="flex justify-center">
            <a href="/register" className="text-sm text-primary">
              Don&nbsp;t have an account? Sign up here
            </a>
          </div>
        </form>
      </Form>
    </>
  );
}
