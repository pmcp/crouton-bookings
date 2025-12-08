// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updateBookingsAsset } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { BookingsAsset } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { assetId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<BookingsAsset>>(event)

  return await updateBookingsAsset(assetId, team.id, user.id, {
    filename: body.filename,
    pathname: body.pathname,
    contentType: body.contentType,
    size: body.size,
    alt: body.alt,
    uploadedAt: body.uploadedAt ? new Date(body.uploadedAt) : body.uploadedAt
  })
})