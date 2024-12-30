import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { UserService } from '@/services/user.service';
import { createClient } from '@/lib/supabase/server';

// @ts-ignore
const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialProvider({
      credentials: {
        email: {
          type: 'email'
        },
        password: {
          type: 'password'
        }
      },
      //@ts-ignore
      async authorize(credentials, req) {
        const service = new UserService();

        const user = await service.getUserByEmail(credentials?.email as string);

        // If the user exists and the password is correct
        //const user:any = await service.login(credentials.email as string, credentials.password as string);

        if (user) {
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  }
} satisfies NextAuthConfig;

export default authConfig;
