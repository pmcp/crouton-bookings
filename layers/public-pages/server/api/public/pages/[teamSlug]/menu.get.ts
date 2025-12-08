import { eq, and, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { teamSlug } = getRouterParams(event)
  const db = useDB()

  // Find team by slug (public lookup, no auth required)
  const team = await db
    .select({ id: tables.teams.id })
    .from(tables.teams)
    .where(eq(tables.teams.slug, teamSlug))
    .get()

  if (!team) {
    throw createError({ statusCode: 404, statusMessage: 'Team not found' })
  }

  // Get menu pages (published + showInMenu)
  const pages = await db
    .select({
      id: tables.bookingsPages.id,
      title: tables.bookingsPages.title,
      slug: tables.bookingsPages.slug,
      order: tables.bookingsPages.order,
    })
    .from(tables.bookingsPages)
    .where(
      and(
        eq(tables.bookingsPages.teamId, team.id),
        eq(tables.bookingsPages.status, 'published'),
        eq(tables.bookingsPages.showInMenu, true)
      )
    )
    .orderBy(asc(tables.bookingsPages.order))

  return pages
})
