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

  // Get the domain to verify it belongs to the team and is verified
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

  if (domain.status !== 'verified') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only verified domains can be set as primary',
    })
  }

  // Remove primary from all other domains for this team
  await db
    .update(tables.domains)
    .set({ isPrimary: false })
    .where(eq(tables.domains.teamId, teamId))

  // Set this domain as primary
  const [updatedDomain] = await db
    .update(tables.domains)
    .set({ isPrimary: true })
    .where(eq(tables.domains.id, domainId))
    .returning()

  return updatedDomain
})
