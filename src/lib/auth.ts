import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbPromise from './mongodb';
import { Usuario, UsuarioSession } from './models';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await dbPromise;
          const user = await db.collection<Usuario>('usuarios').findOne({
            email: credentials.email
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Return user session data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.nombre,
            role: user.rol,
            diasVacaciones: user.diasVacaciones
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.diasVacaciones = user.diasVacaciones;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.diasVacaciones = token.diasVacaciones as number;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
