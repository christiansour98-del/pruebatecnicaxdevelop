import { NextRequest, NextResponse } from 'next/server'

const ALL_USERS = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@test.com`,
  role: i % 2 === 0 ? 'admin' : 'user',
}))

const LIMIT = 10

export async function GET(req: NextRequest) {
  console.log('full url:', req.url)
  console.log('page param:', new URL(req.url).searchParams.get('page'))

  const { searchParams } = new URL(req.url)
  const page  = Number(searchParams.get('page')) || 1
  const start = (page - 1) * LIMIT
  const data  = ALL_USERS.slice(start, start + LIMIT)

  return NextResponse.json({ data, page, totalPages: Math.ceil(ALL_USERS.length / LIMIT) })}

  export async function PATCH(req: NextRequest) {
  const { id, role } = await req.json()
  const user = ALL_USERS.find(u => u.id === id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  // Update the role
  user.role = role
  return NextResponse.json({ success: true, user })
}