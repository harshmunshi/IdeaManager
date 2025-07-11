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

    // Get upvote/downvote counts for the idea
    const voteCountsResult = await db.query(`
      SELECT 
        SUM(CASE WHEN vote_value = 1 THEN 1 ELSE 0 END) as upvote_count,
        SUM(CASE WHEN vote_value = -1 THEN 1 ELSE 0 END) as downvote_count,
        SUM(vote_value) as net_votes
      FROM idea_upvotes 
      WHERE idea_id = $1
    `, [ideaId])

    // Get user's current upvote status
    const userVoteResult = await db.query(`
      SELECT vote_value
      FROM idea_upvotes 
      WHERE idea_id = $1 AND user_id = $2
    `, [ideaId, decoded.userId])

    const voteCounts = voteCountsResult.rows[0] || {
      upvote_count: 0,
      downvote_count: 0,
      net_votes: 0
    }

    const userUpvoteStatus = userVoteResult.rows.length > 0 
      ? userVoteResult.rows[0].vote_value 
      : null

    return NextResponse.json({
      success: true,
      data: {
        upvote_count: parseInt(voteCounts.upvote_count) || 0,
        downvote_count: parseInt(voteCounts.downvote_count) || 0,
        net_votes: parseInt(voteCounts.net_votes) || 0,
        user_upvote_status: userUpvoteStatus
      }
    })
  } catch (error) {
    console.error('Error fetching upvotes:', error)
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

    const { vote_value } = await request.json()

    if (vote_value !== 1 && vote_value !== -1 && vote_value !== null) {
      return NextResponse.json(
        { success: false, message: 'Vote value must be 1 (upvote), -1 (downvote), or null (remove vote)' },
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

    if (vote_value === null) {
      // Remove vote
      await db.query(`
        DELETE FROM idea_upvotes 
        WHERE idea_id = $1 AND user_id = $2
      `, [ideaId, decoded.userId])
    } else {
      // Add or update vote
      await db.query(`
        INSERT INTO idea_upvotes (idea_id, user_id, vote_value) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (idea_id, user_id) 
        DO UPDATE SET vote_value = $3, updated_at = CURRENT_TIMESTAMP
      `, [ideaId, decoded.userId, vote_value])
    }

    return NextResponse.json({
      success: true,
      message: vote_value === null ? 'Vote removed successfully' : 'Vote updated successfully'
    })
  } catch (error) {
    console.error('Error processing upvote:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 