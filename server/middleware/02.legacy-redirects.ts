/**
 * Legacy URL redirects middleware.
 * Redirects old URL patterns to new clean URLs.
 *
 * Redirect rules:
 * - /p/{teamSlug}/{pageSlug} → /{teamSlug}/{pageSlug} (301 permanent)
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Match /p/{teamSlug}/{rest...} pattern
  const legacyMatch = path.match(/^\/p\/([^/]+)(?:\/(.*))?$/)

  if (legacyMatch) {
    const teamSlug = legacyMatch[1]
    const rest = legacyMatch[2] || ''

    // Build new URL: /{teamSlug}/{rest}
    const newPath = rest ? `/${teamSlug}/${rest}` : `/${teamSlug}`

    // Preserve query string if present
    const queryString = url.search || ''

    return sendRedirect(event, `${newPath}${queryString}`, 301)
  }
})
