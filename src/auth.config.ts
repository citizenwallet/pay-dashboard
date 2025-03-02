import { NextAuthConfig, User } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import { verifyOtp } from './db/otp';
import { getServiceRoleClient } from './db';
import { getUserByEmail } from './db/users';


const authConfig = {
  providers: [
    CredentialProvider({
      name: 'OTP Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Verification Code', type: 'text' }
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string;
        const code = credentials?.code as string;

        if (!email || !code) {
          return null;
        }
        const client = getServiceRoleClient();
        const result = await verifyOtp(client, email, code);
        if (!result.valid) {
          return null;
        }
        const userres = await getUserByEmail(client, email);
        if (!userres || userres.error || !userres.data) {
          return null;
          //new user sign up here

          
        }
        if (userres.error) {
          return null;
        }
        console.log("msg by next auth..")
        console.log("user", userres);
        const user = {
          id: (userres.data.id).toString(),
          email: userres.data.email,
          name: userres.data.name || undefined,
        };

        return user;
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
