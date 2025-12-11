/**
 * Composable for managing team context based on URL params or custom domains.
 *
 * Works in two modes:
 * 1. Custom domain: Team is resolved by server middleware from the domain
 * 2. Main domain: Team is extracted from URL params (e.g., /dashboard/[team])
 *
 * Provides URL builders that generate correct paths for both domain types.
 */
export const useTeamContext = () => {
  // State persisted across SSR and client navigation
  const teamId = useState<string | null>('teamContext:teamId', () => null)
  const teamSlug = useState<string | null>('teamContext:teamSlug', () => null)
  const isCustomDomain = useState<boolean>('teamContext:isCustomDomain', () => false)

  // During SSR, check if server middleware resolved a custom domain
  if (import.meta.server) {
    const event = useRequestEvent()
    if (event?.context.isCustomDomain) {
      isCustomDomain.value = true
      teamId.value = event.context.resolvedTeamId ?? null
      teamSlug.value = event.context.resolvedTeamSlug ?? null
    }
  }

  /**
   * Set team context from a URL slug (main domain mode)
   * Validates the slug exists and fetches team data
   * @returns true if team was found, false otherwise
   */
  const setTeamFromSlug = async (slug: string): Promise<boolean> => {
    if (!slug) {
      teamId.value = null
      teamSlug.value = null
      return false
    }

    try {
      const team = await $fetch<{ id: string, slug: string }>(`/api/teams/by-slug/${slug}`)
      if (team) {
        teamId.value = team.id
        teamSlug.value = team.slug
        isCustomDomain.value = false
        return true
      }
    }
    catch {
      // Team not found or error
    }

    teamId.value = null
    teamSlug.value = null
    return false
  }

  /**
   * Set team context directly (custom domain mode)
   * Used when server middleware has already resolved the team
   */
  const setTeamFromDomain = (id: string, slug: string): void => {
    teamId.value = id
    teamSlug.value = slug
    isCustomDomain.value = true
  }

  /**
   * Validate user has access to a team
   * @returns true if user has access, false otherwise
   */
  const validateAccess = async (slug: string): Promise<boolean> => {
    try {
      await $fetch(`/api/teams/by-slug/${slug}/access`)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * Build a public-facing URL for a page
   * - Custom domain: /{path}
   * - Main domain: /{teamSlug}/{path}
   */
  const buildUrl = (path: string): string => {
    // Normalize path to ensure leading slash, no trailing slash
    const normalizedPath = normalizePath(path)

    if (isCustomDomain.value) {
      // Custom domain: just the path
      return normalizedPath || '/'
    }

    // Main domain: prepend team slug
    if (!teamSlug.value) {
      console.warn('[useTeamContext] buildUrl called without team context')
      return normalizedPath || '/'
    }

    return `/${teamSlug.value}${normalizedPath}`
  }

  /**
   * Build a dashboard URL
   * - Custom domain: /dashboard/{path}
   * - Main domain: /dashboard/{teamSlug}/{path}
   */
  const buildDashboardUrl = (path: string): string => {
    // Normalize path
    const normalizedPath = normalizePath(path)

    if (isCustomDomain.value) {
      // Custom domain: /dashboard/path
      return `/dashboard${normalizedPath}`
    }

    // Main domain: /dashboard/team/path
    if (!teamSlug.value) {
      console.warn('[useTeamContext] buildDashboardUrl called without team context')
      return `/dashboard${normalizedPath}`
    }

    return `/dashboard/${teamSlug.value}${normalizedPath}`
  }

  /**
   * Clear the team context
   */
  const clearContext = (): void => {
    teamId.value = null
    teamSlug.value = null
    isCustomDomain.value = false
  }

  /**
   * Get team ID for API calls (compatible with nuxt-crouton)
   * Tries custom domain context first, then falls back to useTeam()
   */
  const getTeamId = (): string | undefined => {
    // First check if we have it from custom domain resolution
    if (teamId.value) {
      return teamId.value
    }

    // Fall back to useTeam() composable (for main domain mode)
    try {
      const { currentTeam } = useTeam()
      if (currentTeam?.value?.id) {
        return currentTeam.value.id
      }
    }
    catch {
      // useTeam not available
    }

    // Last resort: route param
    const route = useRoute()
    const teamParam = route.params.team
    return typeof teamParam === 'string' ? teamParam : undefined
  }

  /**
   * Get team slug (compatible with nuxt-crouton)
   * Tries custom domain context first, then falls back to useTeam()
   */
  const getTeamSlug = (): string | undefined => {
    // First check if we have it from custom domain resolution
    if (teamSlug.value) {
      return teamSlug.value
    }

    // Fall back to useTeam() composable
    try {
      const { currentTeam } = useTeam()
      if (currentTeam?.value?.slug) {
        return currentTeam.value.slug
      }
    }
    catch {
      // useTeam not available
    }

    // Last resort: route param
    const route = useRoute()
    const teamParam = route.params.team
    return typeof teamParam === 'string' ? teamParam : undefined
  }

  return {
    // State (readonly externally via computed would be ideal, but keeping simple)
    teamId: readonly(teamId),
    teamSlug: readonly(teamSlug),
    isCustomDomain: readonly(isCustomDomain),

    // Methods compatible with nuxt-crouton
    getTeamId,
    getTeamSlug,

    // Domain context methods
    setTeamFromSlug,
    setTeamFromDomain,
    validateAccess,
    buildUrl,
    buildDashboardUrl,
    clearContext,
  }
}

/**
 * Normalize a path to have leading slash and no trailing slash
 */
function normalizePath(path: string): string {
  if (!path || path === '/') return ''

  let normalized = path.trim()

  // Ensure leading slash
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }

  // Remove trailing slash
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}
