import { User } from '@/types/auth'
import { prisma } from './prisma'

type UserRole = 'student' | 'admin'

/**
 * Find a user by student ID
 * @param studentId - Student ID to search for
 * @returns User object or null if not found
 */
export async function findUserByStudentId(
  studentId: string
): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        student_id: studentId,
      },
    })
    return user as User | null
  } catch (error) {
    console.error('Error finding user by student ID:', error)
    return null
  }
}

/**
 * Find a user by their unique ID
 * @param id - User ID to search for
 * @returns User object or null if not found
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user as User | null
  } catch (error) {
    console.error('Error finding user by ID:', error)
    return null
  }
}

/**
 * Check if a user's contract status is active
 * @param contractStatus - Contract status to check
 * @returns True if active, false otherwise
 */
export function isActiveContract(contractStatus: string): boolean {
  return contractStatus === 'active'
}

/**
 * Create a new user account
 * @param data - User data
 * @returns Created user
 */
export async function createUser(data: {
  studentId: string
  name?: string
  passwordHash: string
  contractStatus?: string
  role?: UserRole
}) {
  try {
    const user = await prisma.user.create({
      data: {
        student_id: data.studentId,
        name: data.name || data.studentId,
        password_hash: data.passwordHash,
        role: data.role || 'student',
        contract_status: data.contractStatus || 'active',
      },
    })
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Get all users with optional search and role filter
 * @param query - Search query (student_id or name)
 * @returns Array of users
 */
export async function getUsers(query?: string, role?: UserRole | 'all') {
  try {
    const users = await prisma.user.findMany({
      where: {
        ...(role && role !== 'all' && { role }),
        ...(query && {
          OR: [
            {
              student_id: {
                contains: query,
              },
            },
            {
              name: {
                contains: query,
              },
            },
          ],
        }),
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        student_id: true,
        name: true,
        role: true,
        contract_status: true,
        created_at: true,
      },
    })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

/**
 * Update user contract status
 * @param id - User ID
 * @param status - New contract status
 * @returns Updated user
 */
export async function updateUserContractStatus(id: string, status: string) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        contract_status: status,
      },
    })
    return user
  } catch (error) {
    console.error('Error updating user contract status:', error)
    throw error
  }
}

/**
 * Reset user password
 * @param id - User ID
 * @param newPasswordHash - New password hash (bcrypt)
 * @returns Updated user
 */
export async function resetUserPassword(id: string, newPasswordHash: string) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        password_hash: newPasswordHash,
      },
    })
    return user
  } catch (error) {
    console.error('Error resetting user password:', error)
    throw error
  }
}
