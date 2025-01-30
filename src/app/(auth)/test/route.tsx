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
  const supabase = await createClient();

  const user = await checkUserData({ email: 'daniel+test29@wearerebel.org' });

  return Response.json({ user });
}
