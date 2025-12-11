// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { deleteBookingsBooking, getBookingsBookingsByIds } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { sendBookingEmail } from '@@/server/services/booking-emails'

export default defineEventHandler(async (event) => {
  const { bookingId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  // Fetch booking data BEFORE deletion (needed for email)
  const [bookingWithRelations] = await getBookingsBookingsByIds(team.id, [bookingId])

  const result = await deleteBookingsBooking(bookingId, team.id, user.id)

  // Send cancellation email after successful deletion (non-blocking)
  if (bookingWithRelations) {
    sendBookingEmail(bookingWithRelations as unknown as Parameters<typeof sendBookingEmail>[0], 'booking_cancelled')
      .then((emailResult) => {
        if (emailResult) {
          console.log(`Booking deletion cancellation email result for ${bookingId}:`, emailResult)
        }
      })
      .catch((error) => {
        console.error(`Failed to send booking deletion cancellation email for ${bookingId}:`, error)
      })
  }

  return result
})