import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { verifyRefreshToken } from '../../../lib/auth'
import { cookies } from 'next/headers'

const ACCESS_SECRET  = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!)

export async function POST() {
  const cookieStore = cookies()
  const refreshToken = (await cookieStore).get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const payload = await verifyRefreshToken(refreshToken)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }

  // Generate new access token (15 min)
  const newAccessToken = await new SignJWT({ sub: payload.sub, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET)

  // Generate new refresh token (7 days) — rotation
  const newRefreshToken = await new SignJWT({ sub: payload.sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET)

  const response = NextResponse.json({ success: true })

  response.cookies.set('access_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,         // 15 min
    path: '/',
  })

  response.cookies.set('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}