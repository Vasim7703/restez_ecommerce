import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'

// ── Demo accounts for local dev (used when DB is unreachable) ─────────────────
const DEMO_ACCOUNTS = [
  { id: 'a1', name: 'Admin', email: 'admin@restez.com', password: 'admin@restez123', role: 'admin' },
  { id: 'c1', name: 'Arjun Sharma', email: 'arjun@example.com', password: 'customer123', role: 'customer' },
  { id: 'c2', name: 'Priya Patel', email: 'priya@example.com', password: 'customer123', role: 'customer' },
]

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
          // user not in DB — fall through to demo accounts
        } catch {
          // DB unavailable — fall through to demo accounts
        }

        // ── Demo / local-dev fallback ────────────────────────────────────────
        const demo = DEMO_ACCOUNTS.find(a => a.email === credentials.email)
        if (!demo || demo.password !== credentials.password) return null
        return { id: demo.id, name: demo.name, email: demo.email, role: demo.role }
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
