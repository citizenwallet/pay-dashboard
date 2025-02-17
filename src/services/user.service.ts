import { User } from '@/db/users';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export class UserService {
  private db: typeof prisma;

  constructor(db = prisma) {
    this.db = db;
  }

  async getUserByEmail(email: string) {
    return prisma.users.findFirst({
      where: {
        email
      }
    });
  }

  /**
   * Login user
   *
   * @param email
   * @param password
   */
  async login(email: string, password: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(error);
      return null;
    }

    return prisma.users.findFirst({
      where: {
        email
      }
    });
  }

  async create(data: {
    email: string;
    user_id?: string | undefined;
    linked_business_id?: number;
    name?: string;
    phone?: string;
    description?: string;
    image?: string | undefined;
    businessId?: bigint;
  }) {
    return prisma.users.create({
      data
    });
  }

  async upsert(data: User) {
    const user = await prisma.users.findFirst({
      where: {
        email: data.email
      }
    });

    return prisma.users.upsert({
      where: { id: user?.id },
      update: data,
      create: data
    });
  }

  async getCurrentTeam(userId: string) {
    return { name: 'Team A' };
  }
}
