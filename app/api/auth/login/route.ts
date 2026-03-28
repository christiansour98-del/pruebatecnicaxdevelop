import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const ACCESS_SECRET  = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!)

export async function POST(req: Request) {
  const { email, password } = await req.json()
  console.log(`this is the email ${email} this is the password ${password}`)

  const USERS = [
  {
    id: '1',
    email: 'admin@test.com',
    password: '123456',
    role:"admin"        
  },
  {
    id: '2',
    email: 'user@test.com',
    password: 'password123',
    role:"user"
  },
]
  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Generate access token (15 min)
  const accessToken = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET)

  // Generate refresh token (7 days)
  const refreshToken = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET)

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role }
  })

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,           // 15 min
    path: '/',
  })

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,  // 7 days
    path: '/',
  })

  return response
}