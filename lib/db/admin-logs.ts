import { prisma } from './prisma'

/**
 * Log an admin action to the database
 * @param adminId - ID of the admin performing the action
 * @param action - Action type (e.g., 'RESET_PASSWORD', 'CREATE_USER')
 * @param targetUserId - Optional ID of the user affected by the action
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string
) {
  try {
    await prisma.adminActionLog.create({
      data: {
        admin_id: adminId,
        action,
        target_user_id: targetUserId,
      },
    })
  } catch (error) {
    console.error('Error logging admin action:', error)
    // Don't throw - logging failure shouldn't break the main operation
  }
}

/**
 * Get admin action logs with optional filters
 * @param filters - Optional filters for admin_id, target_user_id, or action
 * @param limit - Maximum number of logs to return (default: 100)
 */
export async function getAdminActionLogs(
  filters?: {
    adminId?: string
    targetUserId?: string
    action?: string
  },
  limit: number = 100
) {
  try {
    return await prisma.adminActionLog.findMany({
      where: {
        ...(filters?.adminId && { admin_id: filters.adminId }),
        ...(filters?.targetUserId && { target_user_id: filters.targetUserId }),
        ...(filters?.action && { action: filters.action }),
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    })
  } catch (error) {
    console.error('Error fetching admin action logs:', error)
    return []
  }
}
