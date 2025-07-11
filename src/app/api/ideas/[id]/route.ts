import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const ideaId = parseInt(params.id)
    if (isNaN(ideaId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid idea ID' },
        { status: 400 }
      )
    }

    // Check if the idea exists and belongs to the user
    const ideaResult = await db.query(
      'SELECT * FROM ideas WHERE id = $1 AND created_by = $2',
      [ideaId, decoded.userId]
    )

    if (ideaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Idea not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    // Delete the idea (CASCADE will handle related market research)
    await db.query(
      'DELETE FROM ideas WHERE id = $1 AND created_by = $2',
      [ideaId, decoded.userId]
    )

    return NextResponse.json({
      success: true,
      message: 'Idea deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 