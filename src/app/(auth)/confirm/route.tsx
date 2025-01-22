import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { joinAction } from '@/actions/joinAction';
import { randomUUID } from 'node:crypto';
import { UserService } from '@/services/user.service';
import { createUser } from '@/actions/createUser';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  try {
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
          const userDb = await new UserService().getUserByEmail(email);

          if (!userDb) {
            await createUser({
              email: email,
              auth_id: userRes?.data?.user?.id
            });
          }

          await signIn('credentials', {
            email: email,
            callbackUrl: next
          });

          return NextResponse.redirect('/dashboard');
        } else {
          throw new Error('Failed to get user email');
        }
      } else {
        throw new Error(error.message);
      }
    } else {
      throw new Error('Invalid token');
    }
  } catch (error) {
    if (error instanceof Error) {
      return redirect('/error?message=' + encodeURI(error.message));
    } else {
      console.log(error);
      return redirect('/error?message=' + encodeURI('An error occurred'));
    }
  }
}
