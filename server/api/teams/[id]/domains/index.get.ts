import { validateTeamOwnership } from '@@/server/utils/teamValidation.ts'
import { useDB, tables, eq } from '@@/server/utils/database'

export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'id')
  if (!teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID is required',
    })
  }

  await validateTeamOwnership(event, teamId)

  const db = useDB()
  const domains = await db
    .select()
    .from(tables.domains)
    .where(eq(tables.domains.teamId, teamId))

  return domains
})
