import { useDB, tables, eq, and } from '@@/server/utils/database'

/**
 * Domain resolution middleware.
 * Runs on every request to detect custom domains and resolve them to teams.
 *
 * Sets on event.context:
 * - isCustomDomain: boolean
 * - resolvedTeamId: string | null
 * - resolvedTeamSlug: string | null
 */
export default defineEventHandler(async (event) => {
  const host = getHeader(event, 'host')

  // Skip if no host header
  if (!host) {
    event.context.isCustomDomain = false
    event.context.resolvedTeamId = null
    event.context.resolvedTeamSlug = null
    return
  }

  // Get the main domain from runtime config
  const config = useRuntimeConfig()
  const mainDomain = config.public.host || ''

  // Extract hostname without port for comparison
  const hostWithoutPort = host.split(':')[0]
  const mainDomainWithoutPort = mainDomain
    .replace(/^https?:\/\//, '') // Remove protocol
    .split(':')[0] // Remove port
    .split('/')[0] // Remove path

  // Check if this is the main domain (skip resolution)
  const isMainDomain =
    hostWithoutPort === mainDomainWithoutPort ||
    hostWithoutPort === 'localhost' ||
    hostWithoutPort === '127.0.0.1'

  if (isMainDomain) {
    event.context.isCustomDomain = false
    event.context.resolvedTeamId = null
    event.context.resolvedTeamSlug = null
    return
  }

  // This is a custom domain - look it up
  const db = useDB()

  const domain = await db.query.domains.findFirst({
    where: and(
      eq(tables.domains.domain, hostWithoutPort),
      eq(tables.domains.status, 'verified'),
    ),
    with: {
      team: true,
    },
  })

  if (domain && domain.team) {
    event.context.isCustomDomain = true
    event.context.resolvedTeamId = domain.teamId
    event.context.resolvedTeamSlug = domain.team.slug
  } else {
    // Custom domain not found or not verified
    event.context.isCustomDomain = false
    event.context.resolvedTeamId = null
    event.context.resolvedTeamSlug = null
  }
})
