import { eq, and } from 'drizzle-orm'
import { sendEmail } from '@@/server/services/email'
import { getTeam } from '@@/server/database/queries/teams'
import { bookingsEmailtemplates } from '@@/layers/bookings/collections/emailtemplates/server/database/schema'
import { bookingsEmaillogs } from '@@/layers/bookings/collections/emaillogs/server/database/schema'
import type { BookingsEmailTemplate } from '@@/layers/bookings/collections/emailtemplates/types'

// Types for booking with joined data (from queries.ts)
interface BookingWithRelations {
  id: string
  teamId: string
  owner: string
  location: string
  date: Date | null
  slot: string[] | null
  status: string
  locationData?: {
    id: string
    name: string
    address?: string
  } | null
  ownerUser?: {
    id: string
    name: string
    email: string
  } | null
}

type TriggerType = 'booking_confirmed' | 'reminder_before' | 'booking_cancelled' | 'follow_up_after'
type RecipientType = 'customer' | 'admin' | 'both'

interface TemplateVariables {
  customer_name: string
  customer_email: string
  booking_date: string
  booking_slot: string
  location_name: string
  location_address: string
  team_name: string
}

/**
 * Get active email templates for a specific trigger type
 * Optionally filter by location (templates without locationId apply to all locations)
 */
export async function getActiveTemplatesForTrigger(
  teamId: string,
  triggerType: TriggerType,
  locationId?: string
): Promise<BookingsEmailTemplate[]> {
  const db = useDB()

  const templates = await db
    .select()
    .from(bookingsEmailtemplates)
    .where(
      and(
        eq(bookingsEmailtemplates.teamId, teamId),
        eq(bookingsEmailtemplates.triggerType, triggerType)
      )
    )

  // Filter templates by location:
  // - Templates with no locationId apply to all locations
  // - Templates with a specific locationId only apply to that location
  return templates.filter(template =>
    !template.locationId || template.locationId === locationId
  ) as BookingsEmailTemplate[]
}

/**
 * Render template by replacing variables with actual values
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let rendered = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    rendered = rendered.replace(regex, value || '')
  })

  return rendered
}

/**
 * Format date for display in emails
 */
function formatBookingDate(date: Date | null): string {
  if (!date) return 'Not specified'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

/**
 * Format time slots for display
 */
function formatBookingSlot(slot: string[] | null): string {
  if (!slot || slot.length === 0) return 'Not specified'
  return slot.join(', ')
}

/**
 * Build template variables from booking data
 */
async function buildTemplateVariables(
  booking: BookingWithRelations,
  teamName: string
): Promise<TemplateVariables> {
  return {
    customer_name: booking.ownerUser?.name || 'Customer',
    customer_email: booking.ownerUser?.email || '',
    booking_date: formatBookingDate(booking.date),
    booking_slot: formatBookingSlot(booking.slot),
    location_name: booking.locationData?.name || 'Location',
    location_address: booking.locationData?.address || '',
    team_name: teamName
  }
}

/**
 * Determine recipients based on template recipientType
 * Note: recipientType field not yet in DB, defaults to 'customer'
 */
function getRecipients(
  booking: BookingWithRelations,
  recipientType: RecipientType,
  adminEmail?: string
): string[] {
  const recipients: string[] = []
  const customerEmail = booking.ownerUser?.email

  switch (recipientType) {
    case 'customer':
      if (customerEmail) recipients.push(customerEmail)
      break
    case 'admin':
      if (adminEmail) recipients.push(adminEmail)
      break
    case 'both':
      if (customerEmail) recipients.push(customerEmail)
      if (adminEmail && adminEmail !== customerEmail) recipients.push(adminEmail)
      break
  }

  return recipients
}

/**
 * Log email send attempt to the database
 */
export async function logEmailSend(
  bookingId: string,
  templateId: string,
  recipientEmail: string,
  triggerType: TriggerType,
  status: 'pending' | 'sent' | 'failed',
  createdBy: string,
  error?: string
): Promise<void> {
  const db = useDB()

  await db.insert(bookingsEmaillogs).values({
    bookingId,
    templateId,
    recipientEmail,
    triggerType,
    status,
    sentAt: status === 'sent' ? new Date().toISOString() : null,
    error: error || null,
    createdBy,
    updatedBy: createdBy
  })
}

/**
 * Check if an email was already sent for this booking/template/recipient combination
 */
export async function wasEmailAlreadySent(
  bookingId: string,
  templateId: string,
  recipientEmail: string
): Promise<boolean> {
  const db = useDB()

  const existingLog = await db
    .select({ id: bookingsEmaillogs.id })
    .from(bookingsEmaillogs)
    .where(
      and(
        eq(bookingsEmaillogs.bookingId, bookingId),
        eq(bookingsEmaillogs.templateId, templateId),
        eq(bookingsEmaillogs.recipientEmail, recipientEmail),
        eq(bookingsEmaillogs.status, 'sent')
      )
    )
    .get()

  return !!existingLog
}

/**
 * Main function to send booking emails
 * Finds active templates for the trigger type and sends emails to appropriate recipients
 */
export async function sendBookingEmail(
  booking: BookingWithRelations,
  triggerType: TriggerType,
  adminEmail?: string
): Promise<{ sent: number; failed: number; skipped: number }> {
  const results = { sent: 0, failed: 0, skipped: 0 }

  // Get team info for template variables
  const team = await getTeam(booking.teamId)
  if (!team) {
    console.error(`Team not found for booking ${booking.id}`)
    return results
  }

  // Get active templates for this trigger type
  const templates = await getActiveTemplatesForTrigger(
    booking.teamId,
    triggerType,
    booking.location
  )

  if (templates.length === 0) {
    console.log(`No active templates for trigger ${triggerType} in team ${booking.teamId}`)
    return results
  }

  // Build template variables
  const variables = await buildTemplateVariables(booking, team.name)

  // Process each template
  for (const template of templates) {
    // Note: recipientType not yet in DB schema, defaulting to 'customer'
    const recipientType = (template as BookingsEmailTemplate & { recipientType?: RecipientType }).recipientType || 'customer'
    const recipients = getRecipients(booking, recipientType, adminEmail)

    if (recipients.length === 0) {
      console.log(`No recipients for template ${template.id}`)
      results.skipped++
      continue
    }

    // Render subject and body
    const renderedSubject = renderTemplate(template.subject, variables)
    const renderedBody = renderTemplate(template.body, variables)

    // Send to each recipient
    for (const recipientEmail of recipients) {
      // Check for duplicate sends
      const alreadySent = await wasEmailAlreadySent(booking.id, template.id, recipientEmail)
      if (alreadySent) {
        console.log(`Email already sent for booking ${booking.id}, template ${template.id}, recipient ${recipientEmail}`)
        results.skipped++
        continue
      }

      try {
        await sendEmail({
          to: recipientEmail,
          subject: renderedSubject,
          html: renderedBody
        })

        await logEmailSend(
          booking.id,
          template.id,
          recipientEmail,
          triggerType,
          'sent',
          booking.owner
        )

        results.sent++
        console.log(`Email sent successfully to ${recipientEmail} for booking ${booking.id}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        await logEmailSend(
          booking.id,
          template.id,
          recipientEmail,
          triggerType,
          'failed',
          booking.owner,
          errorMessage
        )

        results.failed++
        console.error(`Failed to send email to ${recipientEmail} for booking ${booking.id}:`, errorMessage)
      }
    }
  }

  return results
}
