import { and, eq, gte, lte, or } from 'drizzle-orm'
import { consola } from 'consola'
import { bookingsEmailtemplates } from '@@/layers/bookings/collections/emailtemplates/server/database/schema'
import { bookingsBookings } from '@@/layers/bookings/collections/bookings/server/database/schema'
import { bookingsLocations } from '@@/layers/bookings/collections/locations/server/database/schema'
import { users } from '@@/server/database/schema'
import { alias } from 'drizzle-orm/sqlite-core'
import { sendBookingEmail, wasEmailAlreadySent } from '@@/server/services/booking-emails'
import type { BookingsEmailTemplate } from '@@/layers/bookings/collections/emailtemplates/types'

// Extended template type that includes fields from schema.json not yet in generated types
interface ExtendedEmailTemplate extends BookingsEmailTemplate {
  isActive?: boolean
  recipientType?: 'customer' | 'admin' | 'both'
}

interface ProcessedResult {
  teamId: string
  bookingId: string
  templateId: string
  triggerType: string
  status: 'sent' | 'skipped' | 'failed'
  error?: string
}

export default defineTask({
  meta: {
    name: 'process-scheduled-emails',
    description: 'Process scheduled reminder and follow-up emails for bookings',
  },
  async run() {
    consola.start('Processing scheduled emails...')
    const results: ProcessedResult[] = []

    try {
      const db = useDB()

      // Get all reminder and follow-up templates
      // Note: Using daysOffset field (treating as hours) since schema generation uses that name
      // isActive field not in DB yet, so we'll treat all templates as active
      const templates = await db
        .select()
        .from(bookingsEmailtemplates)
        .where(
          or(
            eq(bookingsEmailtemplates.triggerType, 'reminder_before'),
            eq(bookingsEmailtemplates.triggerType, 'follow_up_after')
          )
        )

      if (templates.length === 0) {
        consola.info('No scheduled email templates found')
        return { result: { success: true, processed: 0, results: [] } }
      }

      consola.info(`Found ${templates.length} scheduled email templates`)

      // Group templates by team for efficient processing
      const templatesByTeam = templates.reduce((acc, template) => {
        if (!acc[template.teamId]) {
          acc[template.teamId] = []
        }
        acc[template.teamId].push(template as ExtendedEmailTemplate)
        return acc
      }, {} as Record<string, ExtendedEmailTemplate[]>)

      const now = new Date()
      const ownerUsers = alias(users, 'ownerUsers')

      // Process each team's templates
      for (const [teamId, teamTemplates] of Object.entries(templatesByTeam)) {
        consola.info(`Processing team ${teamId} with ${teamTemplates.length} templates`)

        for (const template of teamTemplates) {
          // Skip inactive templates if the field exists
          if (template.isActive === false) {
            consola.debug(`Skipping inactive template ${template.id}`)
            continue
          }

          // Get offset in hours (using daysOffset as hours for now)
          const hoursOffset = template.daysOffset || 0
          const triggerType = template.triggerType as 'reminder_before' | 'follow_up_after'

          // Calculate the target booking time window (1-hour window around exact match)
          // For reminders: booking is in the future, send when now + offset = booking time
          // For follow-ups: booking was in the past, send when now - offset = booking time
          const windowStart = new Date(now)
          const windowEnd = new Date(now)

          if (triggerType === 'reminder_before') {
            // Reminder: booking date should be approximately now + hoursOffset hours
            // Find bookings happening in the next hoursOffset hours (with 30-min window)
            windowStart.setMinutes(windowStart.getMinutes() + (hoursOffset * 60) - 30)
            windowEnd.setMinutes(windowEnd.getMinutes() + (hoursOffset * 60) + 30)
          } else {
            // Follow-up: booking date should be approximately now - hoursOffset hours
            // Find bookings that happened hoursOffset hours ago (with 30-min window)
            windowStart.setMinutes(windowStart.getMinutes() - (hoursOffset * 60) - 30)
            windowEnd.setMinutes(windowEnd.getMinutes() - (hoursOffset * 60) + 30)
          }

          // Build the query for bookings in the time window
          const conditions = [
            eq(bookingsBookings.teamId, teamId),
            gte(bookingsBookings.date, windowStart),
            lte(bookingsBookings.date, windowEnd),
            // Only process confirmed bookings (not cancelled)
            eq(bookingsBookings.status, 'confirmed')
          ]

          // Filter by location if template has one
          if (template.locationId) {
            conditions.push(eq(bookingsBookings.location, template.locationId))
          }

          // Get bookings that match the criteria
          const bookings = await db
            .select({
              id: bookingsBookings.id,
              teamId: bookingsBookings.teamId,
              owner: bookingsBookings.owner,
              location: bookingsBookings.location,
              date: bookingsBookings.date,
              slot: bookingsBookings.slot,
              status: bookingsBookings.status,
              locationData: {
                id: bookingsLocations.id,
                name: bookingsLocations.name,
                address: bookingsLocations.address,
              },
              ownerUser: {
                id: ownerUsers.id,
                name: ownerUsers.name,
                email: ownerUsers.email,
              }
            })
            .from(bookingsBookings)
            .leftJoin(bookingsLocations, eq(bookingsBookings.location, bookingsLocations.id))
            .leftJoin(ownerUsers, eq(bookingsBookings.owner, ownerUsers.id))
            .where(and(...conditions))

          consola.info(`Found ${bookings.length} bookings for template ${template.id} (${triggerType})`)

          // Process each booking
          for (const booking of bookings) {
            const recipientEmail = booking.ownerUser?.email

            // Skip if no recipient email
            if (!recipientEmail) {
              consola.warn(`No email for booking ${booking.id}, skipping`)
              results.push({
                teamId,
                bookingId: booking.id,
                templateId: template.id,
                triggerType,
                status: 'skipped',
                error: 'No recipient email'
              })
              continue
            }

            // Check if we already sent this email (deduplication)
            const alreadySent = await wasEmailAlreadySent(booking.id, template.id, recipientEmail)
            if (alreadySent) {
              consola.debug(`Email already sent for booking ${booking.id}, template ${template.id}`)
              results.push({
                teamId,
                bookingId: booking.id,
                templateId: template.id,
                triggerType,
                status: 'skipped',
                error: 'Already sent'
              })
              continue
            }

            // Send the email using the existing booking email service
            try {
              const sendResult = await sendBookingEmail(
                {
                  id: booking.id,
                  teamId: booking.teamId,
                  owner: booking.owner,
                  location: booking.location,
                  date: booking.date,
                  slot: booking.slot,
                  status: booking.status,
                  locationData: booking.locationData,
                  ownerUser: booking.ownerUser
                },
                triggerType
              )

              if (sendResult.sent > 0) {
                consola.success(`Sent ${triggerType} email for booking ${booking.id}`)
                results.push({
                  teamId,
                  bookingId: booking.id,
                  templateId: template.id,
                  triggerType,
                  status: 'sent'
                })
              } else if (sendResult.skipped > 0) {
                results.push({
                  teamId,
                  bookingId: booking.id,
                  templateId: template.id,
                  triggerType,
                  status: 'skipped',
                  error: 'Skipped by email service'
                })
              } else if (sendResult.failed > 0) {
                results.push({
                  teamId,
                  bookingId: booking.id,
                  templateId: template.id,
                  triggerType,
                  status: 'failed',
                  error: 'Failed to send'
                })
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              consola.error(`Failed to send email for booking ${booking.id}:`, errorMessage)
              results.push({
                teamId,
                bookingId: booking.id,
                templateId: template.id,
                triggerType,
                status: 'failed',
                error: errorMessage
              })
            }
          }
        }
      }

      const summary = {
        total: results.length,
        sent: results.filter(r => r.status === 'sent').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: results.filter(r => r.status === 'failed').length
      }

      consola.success(`Scheduled emails processed: ${summary.sent} sent, ${summary.skipped} skipped, ${summary.failed} failed`)

      return {
        result: {
          success: true,
          processed: results.length,
          summary,
          results
        }
      }
    } catch (error) {
      consola.error('Error processing scheduled emails:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error processing scheduled emails'
      })
    }
  }
})
