import { jwtVerify } from 'jose'
const ACCESS_SECRET  = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!)

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return payload
  } catch {
    return null
  }
}