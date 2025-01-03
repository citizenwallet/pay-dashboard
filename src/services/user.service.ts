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

  async getTeams(userId: string) {}

  async getCurrentTeam(userId: string) {
    return { name: 'Team A' };
  }
}
