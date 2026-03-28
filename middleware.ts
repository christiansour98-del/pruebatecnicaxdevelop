import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './app/lib/auth'
export const runtime = 'nodejs'

const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/refresh']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log('middleware running on:', pathname)

  // exact match for '/' and startsWith for the rest
  const isPublic = pathname === '/' || PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  if (isPublic) return NextResponse.next()

  const accessToken  = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  // 1. Access token valid → continue
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (payload) return NextResponse.next()
  }

  // 2. No access token but has refresh token → try refresh
  if (refreshToken) {
    const refreshRes = await fetch(new URL('/api/auth/refresh', req.url), {
      method: 'POST',
      headers: { cookie: req.headers.get('cookie') || '' },
    })

    if (refreshRes.ok) {
      const response = NextResponse.next()
      refreshRes.headers.getSetCookie().forEach(cookie => {
        response.headers.append('Set-Cookie', cookie)
      })
      return response
    }
  }

  // 3. Both failed → redirect to login
  return NextResponse.redirect(new URL('/login', req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}