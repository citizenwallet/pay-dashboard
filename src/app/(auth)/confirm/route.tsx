import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
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

        if (type === 'signup') {
          // Add user to database
          await createUser({
            email: email,
            auth_id: userRes?.data?.user?.id
          });

          await signIn('credentials', {
            email: userRes?.data?.user?.email,
            callbackUrl: next
          });

          // Generate an invitation code
          const invitationCode = randomUUID();

          joinAction(invitationCode, {
            email: userRes?.data?.user?.email as string,
            name: '',
            description: '',
            image: ``,
            phone: ''
          });

          redirect('/dashboard');
        } else if (email) {
          const userDb = await new UserService().getUserByEmail(email);

          if (!userDb) {
            await createUser({
              email: email,
              auth_id: userRes?.data?.user?.id
            });
          }

          await signIn('credentials', {
            email: userRes?.data?.user?.email,
            callbackUrl: next
          });
        }

        redirect('/dashboard');
      }
    } else {
      throw new Error('Invalid token');
    }
  } catch (error) {
    if (error instanceof Error) {
      redirect('/error?message=' + encodeURI(error.message));
    } else {
      console.log(error);
      redirect('/error?message=' + encodeURI('An error occurred'));
    }
  }
}
