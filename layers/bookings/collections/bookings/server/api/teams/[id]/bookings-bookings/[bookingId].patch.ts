// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updateBookingsBooking } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { BookingsBooking } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { bookingId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<BookingsBooking>>(event)

  return await updateBookingsBooking(bookingId, team.id, user.id, {
    location: body.location,
    date: body.date ? new Date(body.date) : body.date,
    slot: body.slot,
    group: body.group,
    status: body.status
  })
})