import { NextAuthConfig, User } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { checkUserData } from '@/actions/checkUserData';
import { getServiceRoleClient } from './db';
import { getUserByEmail } from './db/users';

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
      async authorize(credentials) {
        const client = getServiceRoleClient();

        const { data: user, error } = await getUserByEmail(
          client,
          credentials.email as string
        );

        if (error || !user) {
          return null;
        }

        // Check if the user is authenticated using Supabase
        const supabaseUser = await client.auth.getUser();

        // If the user is authenticated using Supabase, then we return the user
        if (!user && supabaseUser && credentials.email) {
          await checkUserData(
            {
              email: credentials.email as string
            },
            supabaseUser.data.user
          );

          const { data: userData, error } = await getUserByEmail(
            client,
            credentials.email as string
          );

          if (error || !userData) {
            return null;
          }

          const authUser: User = {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name
          };

          return authUser;
        }

        if (user) {
          const authUser: User = {
            id: user.id.toString(),
            email: user.email,
            name: user.name
          };

          return authUser;
        }

        // If you return null then an error will be displayed advising the user to check their details.
        return null;
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
