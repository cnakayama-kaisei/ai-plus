import { prisma } from './prisma'

const STUDENT_VISIBLE_CONTENT_TYPES = ['video', 'text'] as const

function buildStudentVisibleWhere() {
  return {
    status: 'published',
    type: {
      in: [...STUDENT_VISIBLE_CONTENT_TYPES],
    },
    OR: [
      {
        published_at: null,
      },
      {
        published_at: {
          lte: new Date(),
        },
      },
    ],
  }
}

function extractChapterNumber(title: string) {
  const match = title.match(/chapter\s*0*(\d+)/i)
  if (!match) return null

  const chapterNumber = Number.parseInt(match[1], 10)
  return Number.isNaN(chapterNumber) ? null : chapterNumber
}

function sortContentsForStudents<
  T extends {
    title: string
    published_at: Date | null
    created_at: Date
  },
>(contents: T[]) {
  return [...contents].sort((a, b) => {
    const chapterA = extractChapterNumber(a.title)
    const chapterB = extractChapterNumber(b.title)

    if (chapterA !== null && chapterB !== null && chapterA !== chapterB) {
      return chapterA - chapterB
    }

    if (chapterA !== null && chapterB === null) {
      return -1
    }

    if (chapterA === null && chapterB !== null) {
      return 1
    }

    const publishedAtA = a.published_at?.getTime() ?? 0
    const publishedAtB = b.published_at?.getTime() ?? 0

    if (publishedAtA !== publishedAtB) {
      return publishedAtB - publishedAtA
    }

    return b.created_at.getTime() - a.created_at.getTime()
  })
}

// Cache keys for future cache implementation (Phase 4)
export const CACHE_KEYS = {
  latestPublished: (limit: number) => `contents:latest:${limit}`,
  byId: (id: string) => `content:${id}`,
  search: (keyword: string, page: number, limit: number) =>
    `contents:search:${keyword}:${page}:${limit}`,
} as const

/**
 * Get latest published contents
 * @param limit - Number of contents to fetch
 * @returns Array of published contents with category information
 */
export async function getLatestPublishedContents(limit: number = 5) {
  try {
    const contents = await prisma.content.findMany({
      where: buildStudentVisibleWhere(),
      include: {
        category: true,
      },
      orderBy: [
        {
          published_at: 'desc',
        },
        {
          created_at: 'desc',
        },
      ],
    })
    return sortContentsForStudents(contents).slice(0, limit)
  } catch (error) {
    console.error('Error fetching latest contents:', error)
    return []
  }
}

/**
 * Get content by ID (published only, for students)
 * @param id - Content ID
 * @returns Content with category information or null
 */
export async function getContentById(id: string) {
  try {
    const content = await prisma.content.findFirst({
      where: {
        id,
        ...buildStudentVisibleWhere(),
      },
      include: {
        category: true,
      },
    })
    return content
  } catch (error) {
    console.error('Error fetching content by ID:', error)
    return null
  }
}

/**
 * Get content by ID (for admin, includes drafts)
 * @param id - Content ID
 * @returns Content with category information or null
 */
export async function getContentByIdForAdmin(id: string) {
  try {
    const content = await prisma.content.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    })
    return content
  } catch (error) {
    console.error('Error fetching content by ID for admin:', error)
    return null
  }
}

/**
 * Search published contents by keyword
 * @param keyword - Search keyword
 * @returns Array of matching published contents with category information
 */
export async function searchPublishedContents(keyword: string) {
  try {
    if (!keyword || keyword.trim() === '') {
      return []
    }

    const searchTerm = keyword.trim()

    const contents = await prisma.content.findMany({
      where: {
        AND: [
          buildStudentVisibleWhere(),
          {
            OR: [
              {
                title: {
                  contains: searchTerm,
                },
              },
              {
                description: {
                  contains: searchTerm,
                },
              },
              {
                body: {
                  contains: searchTerm,
                },
              },
            ],
          },
        ],
      },
      include: {
        category: true,
      },
    })
    return sortContentsForStudents(contents)
  } catch (error) {
    console.error('Error searching contents:', error)
    return []
  }
}

/**
 * Search published contents with pagination (offset-based)
 * @param keyword - Search keyword
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 * @returns Paginated search results
 */
export async function searchPublishedContentsWithPagination(
  keyword: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    if (!keyword?.trim()) {
      return { contents: [], total: 0, page, limit, totalPages: 0 }
    }

    const searchTerm = keyword.trim()
    const skip = (page - 1) * limit

    // Run queries in parallel for better performance
    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where: {
          AND: [
            buildStudentVisibleWhere(),
            {
              OR: [
                { title: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                { body: { contains: searchTerm } },
              ],
            },
          ],
        },
        include: { category: true },
      }),
      prisma.content.count({
        where: {
          AND: [
            buildStudentVisibleWhere(),
            {
              OR: [
                { title: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                { body: { contains: searchTerm } },
              ],
            },
          ],
        },
      }),
    ])

    const sortedContents = sortContentsForStudents(contents)
    const paginatedContents = sortedContents.slice(skip, skip + limit)

    return {
      contents: paginatedContents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error('Error searching contents with pagination:', error)
    return { contents: [], total: 0, page, limit, totalPages: 0 }
  }
}

/**
 * Get all contents for admin (including drafts)
 * @param status - Filter by status (optional)
 * @returns Array of all contents with category information
 */
export async function getAllContentsForAdmin(status?: string) {
  try {
    const contents = await prisma.content.findMany({
      where: status ? { status } : undefined,
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    return contents
  } catch (error) {
    console.error('Error fetching contents for admin:', error)
    return []
  }
}

/**
 * Create a new content
 * @param data - Content data
 * @returns Created content
 */
export async function createContent(data: {
  title: string
  description: string
  body?: string | null
  type: string
  video_url?: string | null
  status: string
  published_at?: Date | null
  category_id: string
}) {
  try {
    const content = await prisma.content.create({
      data: {
        title: data.title,
        description: data.description,
        body: data.body || null,
        type: data.type,
        video_url: data.video_url || null,
        status: data.status,
        published_at: data.published_at || null,
        category_id: data.category_id,
      },
      include: {
        category: true,
      },
    })
    return content
  } catch (error) {
    console.error('Error creating content:', error)
    throw error
  }
}

/**
 * Update an existing content
 * @param id - Content ID
 * @param data - Content data to update
 * @returns Updated content
 */
export async function updateContent(
  id: string,
  data: {
    title?: string
    description?: string
    body?: string | null
    type?: string
    video_url?: string | null
    status?: string
    published_at?: Date | null
    category_id?: string
  }
) {
  try {
    const content = await prisma.content.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.body !== undefined && { body: data.body || null }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.video_url !== undefined && { video_url: data.video_url || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.published_at !== undefined && { published_at: data.published_at || null }),
        ...(data.category_id !== undefined && { category_id: data.category_id }),
      },
      include: {
        category: true,
      },
    })
    return content
  } catch (error) {
    console.error('Error updating content:', error)
    throw error
  }
}

/**
 * Get all categories
 * @returns Array of all categories
 */
export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        sort_order: 'asc',
      },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}
