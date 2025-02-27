'use server';

import { getServiceRoleClient } from '@/db';
import { generateRandomString } from '@/lib/utils';
import { createUser } from '@/actions/createUser';
import { User } from '@supabase/auth-js';
import { upsertUser } from './upsertUser';

/**
 * Check user data and consolidate it
 *
 * @param data
 * @param authRes
 */
export async function checkUserData(data: Partial<User>, authRes: any) {
  const supabase = getServiceRoleClient();
  const userDb = await supabase
    .from('users')
    .select()
    .eq('email', data.email)
    .single();

  if (!userDb && data.email) {
    // Find business related to this user if there is no business we link to a new one
    const business = await supabase
      .from('businesses')
      .select()
      .eq('email', data.email)
      .single();

    if (business.error) {
      await fetch('/api/auth/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          name: '',
          phone: '',
          description: '',
          image: ''
        })
      });

      // We need to link the user_id as well
      await upsertUser({
        email: data.email,
        user_id: authRes.user.id
      });
    } else {
      const user = await supabase.auth.getUser();

      await createUser({
        email: data.email,
        user_id: user.data?.user?.id,
        linked_business_id: business.data.id
      });
    }
  }
}
