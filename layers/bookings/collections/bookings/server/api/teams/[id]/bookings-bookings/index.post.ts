// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { createBookingsBooking, getBookingsBookingsByIds } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { sendBookingEmail } from '@@/server/services/booking-emails'

export default defineEventHandler(async (event) => {
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody(event)

  // Exclude id field to let the database generate it
  const { id, ...dataWithoutId } = body

  // Convert date string to Date object
  if (dataWithoutId.date) {
    dataWithoutId.date = new Date(dataWithoutId.date)
  }
  const booking = await createBookingsBooking({
    ...dataWithoutId,
    teamId: team.id,
    owner: user.id,
    createdBy: user.id,
    updatedBy: user.id
  })

  if (!booking) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create booking'
    })
  }

  // Send booking confirmation email (non-blocking)
  // Fetch full booking with relations needed for email variables
  const bookingId = booking.id
  getBookingsBookingsByIds(team.id, [bookingId])
    .then(([bookingWithRelations]) => {
      if (bookingWithRelations) {
        return sendBookingEmail(bookingWithRelations as unknown as Parameters<typeof sendBookingEmail>[0], 'booking_confirmed')
      }
    })
    .then((result) => {
      if (result) {
        console.log(`Booking confirmation email result for ${bookingId}:`, result)
      }
    })
    .catch((error) => {
      console.error(`Failed to send booking confirmation email for ${bookingId}:`, error)
    })

  return booking
})