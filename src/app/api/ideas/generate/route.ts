import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateIdeas } from '@/lib/openai'
import { db } from '@/lib/database'

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

    const { rootIdeaId, context, maxIdeas } = await request.json()

    if (!rootIdeaId || !context || !maxIdeas) {
      return NextResponse.json(
        { success: false, message: 'Root idea ID, context, and max ideas are required' },
        { status: 400 }
      )
    }

    // Get the root idea (anyone can generate from any idea)
    const rootIdeaResult = await db.query(
      'SELECT * FROM ideas WHERE id = $1',
      [rootIdeaId]
    )

    if (rootIdeaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Root idea not found' },
        { status: 404 }
      )
    }

    const rootIdea = rootIdeaResult.rows[0]

    // Generate new ideas using AI
    const generatedIdeas = await generateIdeas(
      rootIdea.title,
      rootIdea.description,
      context,
      Math.min(maxIdeas, 10) // Limit to 10 ideas max
    )

    // Save generated ideas to database
    const savedIdeas = []
    for (const idea of generatedIdeas) {
      const result = await db.query(
        'INSERT INTO ideas (title, description, created_by, parent_idea_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [idea.title, idea.description, decoded.userId, rootIdeaId]
      )
      savedIdeas.push(result.rows[0])
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${savedIdeas.length} new ideas`,
      ideas: savedIdeas
    })
  } catch (error) {
    console.error('Error generating ideas:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate ideas' },
      { status: 500 }
    )
  }
} 