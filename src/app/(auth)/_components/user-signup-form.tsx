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
import GoogleSignInButton from '@/app/(auth)/_components/google-auth-button';
import { signIn } from '@/auth';
import { PhoneInput } from '@/components/ui/phone-input';
import { joinAction } from '@/actions/joinAction';
import { randomUUID } from 'node:crypto';
import { generateRandomString } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().email({ message: 'Enter a valid password' }),
  name: z.string(),
  phone: z.string()
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserSignupForm() {
  const [loading, startTransition] = useTransition();
  const defaultValues = {};
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (credentials: UserFormValue) => {
    try {
      startTransition(async () => {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            emailRedirectTo: process.env.NEXTAUTH_URL + '/dashboard'
          }
        });

        if (error) {
          toast.error('An error occurred while signing up');
          return;
        }

        // Generate an invitation code
        const invitationCode = generateRandomString(16);

        // Create user in database
        const { success } = await joinAction(invitationCode, {
          email: credentials.email,
          name: credentials.name,
          phone: credentials.phone,
          description: '',
          image: ''
        });

        // Create user in database prisma user
        const user = await prisma.users.create({
          data: {
            email: credentials.email,
            name: credentials.name,
            phone: credentials.phone,
            description: ''
          }
        });

        if (success && data?.user?.email) {
          toast.success('Signed Up Successfully, please check your email !');

          setTimeout(() => {
            window.location.href = '/onboarding?token=' + invitationCode;
          }, 5000);
        }
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your name..."
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <PhoneInput defaultCountry="BE" {...field} />
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
                <FormLabel>Email</FormLabel>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto w-full" type="submit">
            Sign Up
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GoogleSignInButton />
    </>
  );
}
