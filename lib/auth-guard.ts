/**
 * Auth Guard Helpers
 * Use these in every API route that requires authentication or admin access.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { NextResponse } from 'next/server'

/** Returns the session or a 401 NextResponse */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, error: null }
}

/** Returns the session only if the user is an admin, else 403 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if ((session.user as any).role !== 'admin') {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session, error: null }
}
