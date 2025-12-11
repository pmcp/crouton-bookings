import { getTeamBySlug } from '@@/server/database/queries/teams'

/**
 * Get basic team info by slug (public endpoint for team context resolution)
 * Only returns id and slug - no sensitive data
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  const team = await getTeamBySlug(slug)

  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Team not found',
    })
  }

  // Only return minimal public info needed for context
  return {
    id: team.id,
    slug: team.slug,
  }
})
