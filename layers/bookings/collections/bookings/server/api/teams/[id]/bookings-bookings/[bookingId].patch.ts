// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updateBookingsBooking, getBookingsBookingsByIds } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { sendBookingEmail } from '@@/server/services/booking-emails'
import type { BookingsBooking } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { bookingId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<BookingsBooking>>(event)

  // Check if status is being changed to 'cancelled'
  const isCancelling = body.status === 'cancelled'

  const booking = await updateBookingsBooking(bookingId, team.id, user.id, {
    location: body.location,
    date: body.date ? new Date(body.date) : body.date,
    slot: body.slot,
    group: body.group,
    status: body.status
  })

  // Send cancellation email if status changed to cancelled (non-blocking)
  if (isCancelling && booking) {
    getBookingsBookingsByIds(team.id, [bookingId])
      .then(([bookingWithRelations]) => {
        if (bookingWithRelations) {
          return sendBookingEmail(bookingWithRelations as unknown as Parameters<typeof sendBookingEmail>[0], 'booking_cancelled')
        }
      })
      .then((result) => {
        if (result) {
          console.log(`Booking cancellation email result for ${bookingId}:`, result)
        }
      })
      .catch((error) => {
        console.error(`Failed to send booking cancellation email for ${bookingId}:`, error)
      })
  }

  return booking
})