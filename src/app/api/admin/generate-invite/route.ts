import { NextRequest, NextResponse } from 'next/server'
import { generateInviteCode, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const inviteCode = await generateInviteCode(decoded.userId)

    return NextResponse.json({
      success: true,
      message: 'Invite code generated successfully',
      inviteCode
    })
  } catch (error) {
    console.error('Error generating invite code:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 