// Batch create bookings endpoint - creates multiple bookings in a single transaction
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { bookingsBookings } from '~~/layers/bookings/collections/bookings/server/database/schema'

interface CartItem {
  id: string
  locationId: string
  locationTitle: string
  date: string
  slotId: string
  slotLabel: string
}

interface BatchRequestBody {
  bookings: CartItem[]
}

export default defineEventHandler(async (event) => {
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<BatchRequestBody>(event)

  if (!body.bookings || !Array.isArray(body.bookings) || body.bookings.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No bookings provided',
    })
  }

  // Limit batch size to prevent abuse
  if (body.bookings.length > 20) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Maximum 20 bookings per batch',
    })
  }

  // Transform cart items to database records
  const bookingsToInsert = body.bookings.map(item => ({
    teamId: team.id,
    owner: user.id,
    location: item.locationId,
    date: new Date(item.date),
    slot: [item.slotId], // Already an array for JSON column
    status: 'pending',
    createdBy: user.id,
    updatedBy: user.id,
  }))

  const db = useDB()

  try {
    // Insert all bookings in a single transaction
    const created = await db
      .insert(bookingsBookings)
      .values(bookingsToInsert)
      .returning()

    return {
      success: true,
      count: created.length,
      bookings: created,
    }
  }
  catch (error: any) {
    console.error('Failed to create batch bookings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create bookings',
    })
  }
})
