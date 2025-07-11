import jwt from 'jsonwebtoken'
import { db } from './database'
import { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret'

export const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      isAdmin: user.is_admin 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const validateInviteCode = async (code: string): Promise<boolean> => {
  try {
    const result = await db.query(
      'SELECT * FROM invite_codes WHERE code = $1 AND is_active = true AND used_by IS NULL',
      [code]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error('Error validating invite code:', error)
    return false
  }
}

export const useInviteCode = async (code: string, userId: number): Promise<boolean> => {
  try {
    const result = await db.query(
      'UPDATE invite_codes SET used_by = $1, used_at = CURRENT_TIMESTAMP WHERE code = $2 AND is_active = true AND used_by IS NULL RETURNING *',
      [userId, code]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error('Error using invite code:', error)
    return false
  }
}

export const generateInviteCode = async (adminId: number): Promise<string> => {
  const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  try {
    await db.query(
      'INSERT INTO invite_codes (code, created_by) VALUES ($1, $2)',
      [code, adminId]
    )
    return code
  } catch (error) {
    console.error('Error generating invite code:', error)
    throw new Error('Failed to generate invite code')
  }
} 