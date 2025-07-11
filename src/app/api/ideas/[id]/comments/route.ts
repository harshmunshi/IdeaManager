import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET(
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

    // Get comments for the idea with user information
    const commentsResult = await db.query(`
      SELECT 
        c.id, c.comment, c.created_at, c.updated_at,
        u.id as user_id, u.email as user_email
      FROM idea_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.idea_id = $1
      ORDER BY c.created_at DESC
    `, [ideaId])

    const comments = commentsResult.rows.map(row => ({
      id: row.id,
      idea_id: ideaId,
      user_id: row.user_id,
      comment: row.comment,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        email: row.user_email
      }
    }))

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const { comment } = await request.json()

    if (!comment || typeof comment !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Comment is required' },
        { status: 400 }
      )
    }

    // Check word count (approximately 100 words)
    const wordCount = comment.trim().split(/\s+/).length
    if (wordCount > 100) {
      return NextResponse.json(
        { success: false, message: 'Comment must be 100 words or less' },
        { status: 400 }
      )
    }

    // Check if comment is too long (500 characters as per DB constraint)
    if (comment.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Comment is too long (maximum 500 characters)' },
        { status: 400 }
      )
    }

    // Check if idea exists
    const ideaResult = await db.query(
      'SELECT id FROM ideas WHERE id = $1',
      [ideaId]
    )

    if (ideaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Idea not found' },
        { status: 404 }
      )
    }

    // Add comment
    const result = await db.query(`
      INSERT INTO idea_comments (idea_id, user_id, comment) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [ideaId, decoded.userId, comment.trim()])

    // Get user information for the response
    const userResult = await db.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    )

    const newComment = {
      ...result.rows[0],
      user: userResult.rows[0]
    }

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 