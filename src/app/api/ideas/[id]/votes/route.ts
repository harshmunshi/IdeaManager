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

    // Get vote counts for the idea
    const voteCountsResult = await db.query(`
      SELECT 
        vote_type,
        COUNT(*) as count
      FROM idea_votes 
      WHERE idea_id = $1 
      GROUP BY vote_type
    `, [ideaId])

    // Get user's current votes
    const userVotesResult = await db.query(`
      SELECT vote_type
      FROM idea_votes 
      WHERE idea_id = $1 AND user_id = $2
    `, [ideaId, decoded.userId])

    const voteCounts = {
      help_build_count: 0,
      use_service_count: 0
    }

    voteCountsResult.rows.forEach(row => {
      if (row.vote_type === 'help_build') {
        voteCounts.help_build_count = parseInt(row.count)
      } else if (row.vote_type === 'use_service') {
        voteCounts.use_service_count = parseInt(row.count)
      }
    })

    const userVotes = {
      user_help_build_vote: userVotesResult.rows.some(row => row.vote_type === 'help_build'),
      user_use_service_vote: userVotesResult.rows.some(row => row.vote_type === 'use_service')
    }

    return NextResponse.json({
      success: true,
      data: {
        ...voteCounts,
        ...userVotes
      }
    })
  } catch (error) {
    console.error('Error fetching votes:', error)
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

    const { vote_type, action } = await request.json()

    if (!vote_type || !action) {
      return NextResponse.json(
        { success: false, message: 'Vote type and action are required' },
        { status: 400 }
      )
    }

    if (!['help_build', 'use_service'].includes(vote_type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid vote type' },
        { status: 400 }
      )
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
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

    if (action === 'add') {
      // Add vote (ON CONFLICT DO NOTHING handles duplicate votes)
      await db.query(`
        INSERT INTO idea_votes (idea_id, user_id, vote_type) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (idea_id, user_id, vote_type) DO NOTHING
      `, [ideaId, decoded.userId, vote_type])
    } else {
      // Remove vote
      await db.query(`
        DELETE FROM idea_votes 
        WHERE idea_id = $1 AND user_id = $2 AND vote_type = $3
      `, [ideaId, decoded.userId, vote_type])
    }

    return NextResponse.json({
      success: true,
      message: `Vote ${action}ed successfully`
    })
  } catch (error) {
    console.error('Error processing vote:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 