/**
 * Reserved slugs that cannot be used as team slugs.
 * These are reserved for system routes, static assets, and future features.
 */
export const RESERVED_SLUGS = [
  // System routes
  'dashboard',
  'api',
  'auth',
  'login',
  'logout',
  'onboard',
  'account-settings',
  'super-admin',

  // Legacy routes
  'p',

  // Nuxt/App internals
  'app',
  '_nuxt',

  // Documentation & Help
  'help',
  'docs',

  // Static assets
  'cdn',
  'assets',
  'static',
] as const

export type ReservedSlug = (typeof RESERVED_SLUGS)[number]

/**
 * Check if a slug is reserved and cannot be used as a team slug.
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as ReservedSlug)
}
