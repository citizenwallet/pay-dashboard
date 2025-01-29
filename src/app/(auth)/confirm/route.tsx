import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { UserService } from '@/services/user.service';
import { createUser } from '@/actions/createUser';
import { joinAction } from '@/actions/joinAction';
import { generateRandomString } from '@/lib/utils';
import { checkUserData } from '@/actions/checkUserData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  let redirectUrl = next;

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
          // Find business related to this user if no businss we link to a new ones
          const business = await supabase
            .from('businesses')
            .select()
            .eq('email', email)
            .single();

          if (business.error) {
            const randomString = generateRandomString(16);
            await joinAction(randomString, {
              email: email,
              name: '',
              phone: '',
              description: '',
              image: ''
            });
          } else {
            await createUser({
              email: email,
              user_id: userRes?.data?.user?.id,
              linked_business_id: business.data.id
            });
          }
        } else {
          // Prevent user already registered but not having business ID linked
          const randomString = generateRandomString(16);
          await joinAction(randomString, {
            email: email,
            name: '',
            phone: '',
            description: '',
            image: ''
          });
        }

        await checkUserData(email);

        try {
          await signIn('credentials', {
            email: email
          });
        } catch (error) {
          return (redirectUrl = redirectUrl =
            process.env.NEXTAUTH_URL + '/login?error=sign_in_failed');
        } finally {
        }
      } else {
        return (redirectUrl =
          process.env.NEXTAUTH_URL + '/error?error=invalid_email');
      }
    } else {
      return (redirectUrl =
        process.env.NEXTAUTH_URL + '/login?error=verify_otp_failed');
    }
  } else {
    return (redirectUrl =
      process.env.NEXTAUTH_URL + '/login?error=invalid_token');
  }

  return redirect(redirectUrl);
}
