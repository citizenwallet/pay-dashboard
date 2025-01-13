import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    });

    if (!error) {
      const userRes = await supabase.auth.getUser();
      const email = userRes?.data?.user?.email;

      if (email) {
        await signIn('credentials', {
          email: userRes?.data?.user?.email,
          callbackUrl: next
        });
      }

      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error');
}
