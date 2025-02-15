import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { UserService } from '@/services/user.service';
import { createClient } from '@/lib/supabase/server';
import { checkUserData } from '@/actions/checkUserData';

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

        let user: any = await service.getUserByEmail(
          credentials.email as string
        );

        // Check if the user is authenticated using Supabase
        const supabase = await createClient();
        const supabaseUser = await supabase.auth.getUser();

        //console.log(credentials, user, supabaseUser);

        // If the user is authenticated using Supabase, then we return the user
        if (!user && supabaseUser && credentials.email) {
          await checkUserData(
            {
              email: credentials.email as string
            },
            supabaseUser.data.user
          );

          user = await service.getUserByEmail(credentials.email as string);
        }

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
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: `${token.id}`
        }
      };
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
