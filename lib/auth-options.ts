import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'



export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Basic email format guard
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) return null

        // ── Try real DB first ────────────────────────────────────────────────
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (user) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            if (!isPasswordValid) return null
            if (!user.verified) return null
            return { id: user.id, name: user.name, email: user.email, role: user.role }
          }
          // user not in DB
          return null
        } catch {
          // DB unavailable
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 }, // 7 days
  secret: process.env.NEXTAUTH_SECRET,
}
