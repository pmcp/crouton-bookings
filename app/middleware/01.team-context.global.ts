/**
 * Global middleware that sets team context on every navigation.
 *
 * Works in two modes:
 * 1. Custom domain: Server middleware has already resolved the team from the domain.
 *    We just need to sync that to the client-side composable.
 * 2. Main domain: We extract the team slug from URL params and resolve it.
 *
 * The "01." prefix ensures this runs before other middleware that may depend on team context.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const teamContext = useTeamContext()

  // During SSR, the composable already reads from event.context in its constructor.
  // On client-side navigation, we need to check if we're in custom domain mode
  // and ensure the context is properly maintained.

  if (import.meta.server) {
    // Server-side: useTeamContext already initializes from event.context
    // But we still need to handle main domain URL params
    if (!teamContext.isCustomDomain.value) {
      // Main domain: extract team from URL params
      const teamSlug = extractTeamSlug(to)
      if (teamSlug && teamSlug !== teamContext.teamSlug.value) {
        await teamContext.setTeamFromSlug(teamSlug)
      }
    }
    return
  }

  // Client-side navigation
  if (teamContext.isCustomDomain.value) {
    // Custom domain mode: team context should persist across navigations
    // No action needed - the context is already set from initial SSR
    return
  }

  // Main domain mode: extract team from URL and update context
  const teamSlug = extractTeamSlug(to)

  if (!teamSlug) {
    // No team in URL - clear context if it was set
    if (teamContext.teamSlug.value) {
      teamContext.clearContext()
    }
    return
  }

  // Only update if the team changed
  if (teamSlug !== teamContext.teamSlug.value) {
    await teamContext.setTeamFromSlug(teamSlug)
  }
})

/**
 * Extract team slug from route params.
 * Handles various route patterns:
 * - /dashboard/[team]/... -> params.team
 * - /[teamSlug]/... -> params.teamSlug
 */
function extractTeamSlug(route: { params: Record<string, string | string[]> }): string | null {
  // Check for 'team' param (dashboard routes)
  const teamParam = route.params.team
  if (teamParam) {
    const slug = Array.isArray(teamParam) ? teamParam[0] : teamParam
    return slug || null
  }

  // Check for 'teamSlug' param (public routes on main domain)
  const teamSlugParam = route.params.teamSlug
  if (teamSlugParam) {
    const slug = Array.isArray(teamSlugParam) ? teamSlugParam[0] : teamSlugParam
    return slug || null
  }

  return null
}
