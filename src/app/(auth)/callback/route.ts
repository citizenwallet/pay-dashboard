import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserData } from '@/actions/checkUserData';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  let redirectUrl = `${origin}/auth/auth-code-error`;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { user } = data;

      if (user.email) {
        await checkUserData(user, user);

        const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === 'development';
        if (isLocalEnv) {
          // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
          redirectUrl = `${origin}${next}`;
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`;
        } else {
          redirectUrl = `${origin}${next}`;
        }
      } else {
        redirectUrl = `${origin}/auth/auth-code-error`;
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(redirectUrl);
}
