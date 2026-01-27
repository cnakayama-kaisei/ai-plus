import { PrismaClient } from '@prisma/client'
import { User } from '@/types/auth'

const prisma = new PrismaClient()

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
    return user
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
    return user
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
