import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
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

    const result = await db.query(`
      SELECT 
        i.*, 
        u.email as user_email,
        -- Vote counts
        COALESCE(v_help.help_build_count, 0) as help_build_count,
        COALESCE(v_use.use_service_count, 0) as use_service_count,
        -- Upvote counts
        COALESCE(uv.upvote_count, 0) as upvote_count,
        COALESCE(uv.downvote_count, 0) as downvote_count,
        COALESCE(uv.net_votes, 0) as net_votes,
        -- Comments count
        COALESCE(c.comments_count, 0) as comments_count,
        -- User's current votes
        CASE WHEN user_votes.help_build_vote IS NOT NULL THEN true ELSE false END as user_help_build_vote,
        CASE WHEN user_votes.use_service_vote IS NOT NULL THEN true ELSE false END as user_use_service_vote,
        user_upvotes.vote_value as user_upvote_status
      FROM ideas i 
      JOIN users u ON i.created_by = u.id 
      -- Help build votes
      LEFT JOIN (
        SELECT idea_id, COUNT(*) as help_build_count 
        FROM idea_votes 
        WHERE vote_type = 'help_build' 
        GROUP BY idea_id
      ) v_help ON i.id = v_help.idea_id
      -- Use service votes
      LEFT JOIN (
        SELECT idea_id, COUNT(*) as use_service_count 
        FROM idea_votes 
        WHERE vote_type = 'use_service' 
        GROUP BY idea_id
      ) v_use ON i.id = v_use.idea_id
      -- Upvotes/downvotes
      LEFT JOIN (
        SELECT 
          idea_id,
          SUM(CASE WHEN vote_value = 1 THEN 1 ELSE 0 END) as upvote_count,
          SUM(CASE WHEN vote_value = -1 THEN 1 ELSE 0 END) as downvote_count,
          SUM(vote_value) as net_votes
        FROM idea_upvotes 
        GROUP BY idea_id
      ) uv ON i.id = uv.idea_id
      -- Comments count
      LEFT JOIN (
        SELECT idea_id, COUNT(*) as comments_count 
        FROM idea_comments 
        GROUP BY idea_id
      ) c ON i.id = c.idea_id
      -- User's current votes
      LEFT JOIN (
        SELECT 
          idea_id,
          MAX(CASE WHEN vote_type = 'help_build' THEN 1 END) as help_build_vote,
          MAX(CASE WHEN vote_type = 'use_service' THEN 1 END) as use_service_vote
        FROM idea_votes 
        WHERE user_id = $1
        GROUP BY idea_id
      ) user_votes ON i.id = user_votes.idea_id
      -- User's current upvote status
      LEFT JOIN idea_upvotes user_upvotes ON i.id = user_upvotes.idea_id AND user_upvotes.user_id = $1
      ORDER BY i.created_at DESC
    `, [decoded.userId])

    // Transform the data to include vote_counts object
    const ideas = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      created_by: row.created_by,
      parent_idea_id: row.parent_idea_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_email: row.user_email,
      vote_counts: {
        help_build_count: parseInt(row.help_build_count) || 0,
        use_service_count: parseInt(row.use_service_count) || 0,
        upvote_count: parseInt(row.upvote_count) || 0,
        downvote_count: parseInt(row.downvote_count) || 0,
        net_votes: parseInt(row.net_votes) || 0,
        user_help_build_vote: row.user_help_build_vote,
        user_use_service_vote: row.user_use_service_vote,
        user_upvote_status: row.user_upvote_status
      },
      comments_count: parseInt(row.comments_count) || 0
    }))

    return NextResponse.json({
      success: true,
      ideas: ideas
    })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    const { title, description, parentIdeaId } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required' },
        { status: 400 }
      )
    }

    const result = await db.query(
      'INSERT INTO ideas (title, description, created_by, parent_idea_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, decoded.userId, parentIdeaId || null]
    )

    return NextResponse.json({
      success: true,
      message: 'Idea created successfully',
      idea: result.rows[0]
    })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 