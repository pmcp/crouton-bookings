import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const teamSlug = query.teamSlug as string
  const path = query.path as string

  const db = useDB()

  if (!teamSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Team slug is required' })
  }

  // Normalize path: ensure leading slash, no trailing slash
  let normalizedPath = path || '/'
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath
  }
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1)
  }

  // Find team by slug (public lookup, no auth required)
  const team = await db
    .select({ id: tables.teams.id })
    .from(tables.teams)
    .where(eq(tables.teams.slug, teamSlug))
    .get()

  if (!team) {
    throw createError({ statusCode: 404, statusMessage: 'Team not found' })
  }

  // Find published page by path
  const page = await db
    .select()
    .from(tables.bookingsPages)
    .where(
      and(
        eq(tables.bookingsPages.teamId, team.id),
        eq(tables.bookingsPages.path, normalizedPath),
        eq(tables.bookingsPages.status, 'published')
      )
    )
    .get()

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  return page
})
