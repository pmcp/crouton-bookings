// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updateBookingsLocation } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { BookingsLocation } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { locationId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<BookingsLocation>>(event)

  return await updateBookingsLocation(locationId, team.id, user.id, {
    title: body.title,
    street: body.street,
    zip: body.zip,
    city: body.city,
    location: body.location,
    content: body.content,
    allowedMemberIds: body.allowedMemberIds,
    slots: body.slots
  })
})