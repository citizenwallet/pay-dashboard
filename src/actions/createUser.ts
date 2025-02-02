'use server';

import { UserService } from '@/services/user.service';

export async function createUser(data: {
  email: string;
  user_id?: string | undefined;
  linked_business_id?: any;
  name?: string;
  phone?: string;
  description?: string;
  image?: string | undefined;
  businessId?: bigint;
}) {
  return new UserService().create(data);
}
