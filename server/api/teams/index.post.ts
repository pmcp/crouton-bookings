import { createTeam } from '@@/server/database/queries/teams'
import { createTeamSchema } from '@@/shared/validations/team'
import { validateBody } from '@@/server/utils/bodyValidation'
import { isReservedSlug } from '@@/server/config/reserved-slugs'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await validateBody(event, createTeamSchema)

  // Validate slug is not reserved
  if (isReservedSlug(body.slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This slug is reserved and cannot be used for a team.',
    })
  }

  const team = await createTeam({
    name: body.name,
    ownerId: user.id,
    slug: body.slug,
    logo: body.logo,
  })
  return team
})
