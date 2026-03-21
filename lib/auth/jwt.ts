import jwt from 'jsonwebtoken'
import { JWTPayload } from '@/types/auth'

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return secret
}

/**
 * Generate a JWT token for a user
 * @param payload - User information to encode in the token
 * @returns JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extract JWT token from Authorization header or cookie
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null

  // Support "Bearer <token>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return authHeader
}
