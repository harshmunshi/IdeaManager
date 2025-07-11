import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Initialize database schema
    await initializeDatabase()

    // Check if admin user already exists
    const adminCheck = await db.query('SELECT * FROM users WHERE is_admin = true LIMIT 1')
    
    if (adminCheck.rows.length === 0) {
      // Create first admin user
      const { email } = await request.json()
      
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Admin email is required' },
          { status: 400 }
        )
      }

      const adminUser = await db.query(
        'INSERT INTO users (email, is_admin) VALUES ($1, $2) RETURNING *',
        [email, true]
      )

      // Create an admin invite code that the admin can use
      const adminInviteCode = 'ADMIN-' + Math.random().toString(36).substring(2, 15).toUpperCase()
      await db.query(
        'INSERT INTO invite_codes (code, created_by) VALUES ($1, $2)',
        [adminInviteCode, adminUser.rows[0].id]
      )

      return NextResponse.json({
        success: true,
        message: 'Database initialized and admin user created',
        admin: adminUser.rows[0],
        adminInviteCode: adminInviteCode,
        instructions: `Use invite code "${adminInviteCode}" with email "${email}" to access the admin dashboard`
      })
    } else {
      // Admin exists, create a new invite code for them
      const adminInviteCode = 'ADMIN-' + Math.random().toString(36).substring(2, 15).toUpperCase()
      await db.query(
        'INSERT INTO invite_codes (code, created_by) VALUES ($1, $2)',
        [adminInviteCode, adminCheck.rows[0].id]
      )

      return NextResponse.json({
        success: true,
        message: 'Database initialized (admin user already exists)',
        admin: adminCheck.rows[0],
        adminInviteCode: adminInviteCode,
        instructions: `Use invite code "${adminInviteCode}" with your admin email to access the dashboard`
      })
    }
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to initialize database', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 