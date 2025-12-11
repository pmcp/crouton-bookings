import { validateTeamOwnership } from '@@/server/utils/teamValidation.ts'
import { useDB, tables, eq, and } from '@@/server/utils/database'

export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'id')
  const domainId = getRouterParam(event, 'domainId')

  if (!teamId || !domainId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID and domain ID are required',
    })
  }

  await validateTeamOwnership(event, teamId)

  const db = useDB()

  // Get the domain to verify it belongs to the team
  const domain = await db
    .select()
    .from(tables.domains)
    .where(and(eq(tables.domains.id, domainId), eq(tables.domains.teamId, teamId)))
    .get()

  if (!domain) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Domain not found',
    })
  }

  // Delete the domain
  await db.delete(tables.domains).where(eq(tables.domains.id, domainId))

  // If this was the primary domain, promote another domain if available
  if (domain.isPrimary) {
    const nextDomain = await db
      .select()
      .from(tables.domains)
      .where(eq(tables.domains.teamId, teamId))
      .limit(1)
      .get()

    if (nextDomain) {
      await db
        .update(tables.domains)
        .set({ isPrimary: true })
        .where(eq(tables.domains.id, nextDomain.id))
    }
  }

  return { message: 'Domain deleted successfully' }
})
