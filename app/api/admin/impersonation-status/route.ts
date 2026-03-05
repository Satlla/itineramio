import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const impersonationCookie = cookieStore.get('admin-impersonation')
    const adminToken = cookieStore.get('admin-token')
    const authToken = cookieStore.get('auth-token')

    // No impersonation cookie
    if (!impersonationCookie) {
      return NextResponse.json({ isImpersonating: false, data: null })
    }

    // Orphaned cookie: auth-token exists but no admin-token
    if (authToken && !adminToken) {
      // Clean up orphaned cookie
      const response = NextResponse.json({ isImpersonating: false, data: null })
      response.cookies.set('admin-impersonation', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      })
      return response
    }

    // No session at all
    if (!adminToken && !authToken) {
      const response = NextResponse.json({ isImpersonating: false, data: null })
      response.cookies.set('admin-impersonation', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      })
      return response
    }

    // Parse cookie data
    try {
      const data = JSON.parse(impersonationCookie.value)
      return NextResponse.json({
        isImpersonating: true,
        data: {
          adminId: data.adminId,
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          targetUserId: data.targetUserId,
          targetUserName: data.targetUserName,
          targetUserEmail: data.targetUserEmail,
          startedAt: data.startedAt
        }
      })
    } catch {
      // Corrupted cookie, clean up
      const response = NextResponse.json({ isImpersonating: false, data: null })
      response.cookies.set('admin-impersonation', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      })
      return response
    }
  } catch {
    return NextResponse.json({ isImpersonating: false, data: null })
  }
}
