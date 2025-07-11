import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateMarketResearch } from '@/lib/openai'
import { db } from '@/lib/database'

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

    // Get the idea (anyone can generate research for any idea)
    const ideaResult = await db.query(
      'SELECT * FROM ideas WHERE id = $1',
      [ideaId]
    )

    if (ideaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Idea not found' },
        { status: 404 }
      )
    }

    const idea = ideaResult.rows[0]

    // Check if market research already exists
    const existingResearch = await db.query(
      'SELECT * FROM market_research WHERE idea_id = $1',
      [ideaId]
    )

    let marketResearch
    if (existingResearch.rows.length > 0) {
      marketResearch = existingResearch.rows[0]
    } else {
      // Generate new market research
      const researchData = await generateMarketResearch(idea.title, idea.description)

      // Save to database
      const result = await db.query(
        'INSERT INTO market_research (idea_id, research_data) VALUES ($1, $2) RETURNING *',
        [ideaId, researchData]
      )
      marketResearch = result.rows[0]
    }

    return NextResponse.json({
      success: true,
      marketResearch: {
        id: marketResearch.id,
        idea_id: marketResearch.idea_id,
        research_data: marketResearch.research_data,
        created_at: marketResearch.created_at,
        updated_at: marketResearch.updated_at
      }
    })
  } catch (error) {
    console.error('Error generating market research:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate market research' },
      { status: 500 }
    )
  }
}

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

    // Get market research if it exists (anyone can view research for any idea)
    const result = await db.query(`
      SELECT mr.* FROM market_research mr
      WHERE mr.idea_id = $1
    `, [ideaId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Market research not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      marketResearch: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching market research:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 