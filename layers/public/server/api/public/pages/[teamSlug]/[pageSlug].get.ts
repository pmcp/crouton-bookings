import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { teamSlug, pageSlug } = getRouterParams(event)
  const db = useDB()

  if (!teamSlug || !pageSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Team slug and page slug are required' })
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

  // Find published page by slug
  const page = await db
    .select()
    .from(tables.bookingsPages)
    .where(
      and(
        eq(tables.bookingsPages.teamId, team.id),
        eq(tables.bookingsPages.slug, pageSlug),
        eq(tables.bookingsPages.status, 'published')
      )
    )
    .get()

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  return page
})
