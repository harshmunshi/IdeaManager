import { NextRequest, NextResponse } from 'next/server'
import { validateInviteCode, useInviteCode, generateToken } from '@/lib/auth'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, email } = await request.json()

    if (!inviteCode || !email) {
      return NextResponse.json(
        { success: false, message: 'Invite code and email are required' },
        { status: 400 }
      )
    }

    // Validate invite code
    const isValid = await validateInviteCode(inviteCode)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired invite code' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    let user
    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0]
    } else {
      // Create new user
      const newUser = await db.query(
        'INSERT INTO users (email) VALUES ($1) RETURNING *',
        [email]
      )
      user = newUser.rows[0]
    }

    // Use the invite code
    await useInviteCode(inviteCode, user.id)

    // Generate JWT token
    const token = generateToken(user)

    return NextResponse.json({
      success: true,
      message: 'Invite code validated successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Error validating invite code:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 