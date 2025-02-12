import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { checkUserData } from '@/actions/checkUserData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  let redirectUrl = searchParams.get('next') ?? '/dashboard';

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
        // Consolidate email and data
        await checkUserData(
          {
            email
          },
          userRes?.data?.user
        );

        await signIn(
          'credentials',
          {
            email: email
          },
          {
            callbackUrl: redirectUrl
          }
        )
          .then(() => {
            redirectUrl = '/dashboard';
          })
          .catch(() => {
            // silently catch the error
          })
          .finally(() => {});
      } else {
        redirectUrl =
          process.env.NEXT_PUBLIC_URL + '/error?error=invalid_email';
      }
    } else {
      redirectUrl =
        process.env.NEXT_PUBLIC_URL + '/login?error=verify_otp_failed';
    }
  } else {
    redirectUrl = process.env.NEXT_PUBLIC_URL + '/login?error=invalid_token';
  }

  /**
   * Redirect to the next page
   *
   * @comment This should always be sent outside of try-catch-finally block
   * @see https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirect-function
   */
  return redirect(redirectUrl);
}
