import { getBookingsByLocationAndDateRange } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'

export default defineEventHandler(async (event) => {
  const { team } = await resolveTeamAndCheckMembership(event)

  const query = getQuery(event)

  const locationId = query.locationId as string
  const startDate = query.startDate as string
  const endDate = query.endDate as string

  if (!locationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'locationId is required'
    })
  }

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'startDate and endDate are required'
    })
  }

  const bookings = await getBookingsByLocationAndDateRange(
    team.id,
    locationId,
    new Date(startDate),
    new Date(endDate)
  )

  // Group bookings by date (ISO date string as key)
  const bookingsByDate: Record<string, { bookedSlots: string[] }> = {}

  for (const booking of bookings) {
    // Normalize date to ISO date string (YYYY-MM-DD)
    const isoString = booking.date.toISOString()
    const dateKey = isoString.substring(0, 10)

    if (!bookingsByDate[dateKey]) {
      bookingsByDate[dateKey] = { bookedSlots: [] }
    }

    // slot is an array of slot IDs
    if (Array.isArray(booking.slot)) {
      bookingsByDate[dateKey].bookedSlots.push(...booking.slot)
    }
  }

  return bookingsByDate
})
