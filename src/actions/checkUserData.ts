'use server';

import { getServiceRoleClient } from '@/db';
import { joinAction } from '@/actions/joinAction';
import { generateRandomString } from '@/lib/utils';
import { createUser } from '@/actions/createUser';

/**
 * Check user data and consolidate it
 * s
 * @param data
 */
export async function checkUserData(data: any) {
  const supabase = await getServiceRoleClient();
  const userDb = await supabase
    .from('users')
    .select()
    .eq('email', data.email)
    .single();

  if (!userDb) {
    // Find business related to this user if no business we link to a new one
    const business = await supabase
      .from('businesses')
      .select()
      .eq('email', data.email)
      .single();

    if (business.error) {
      const randomString = generateRandomString(16);
      await joinAction(randomString, {
        email: data.email,
        name: '',
        phone: '',
        description: '',
        image: ''
      });
    } else {
      const user = await supabase.auth.getUser();

      await createUser({
        email: data.email,
        user_id: user.data?.user?.id,
        linked_business_id: business.data.id
      });
    }
  } else {
    // Prevent user already registered but not having business ID linked
    const randomString = generateRandomString(16);
    await joinAction(randomString, {
      email: data.email,
      name: '',
      phone: '',
      description: '',
      image: ''
    });
  }
}
