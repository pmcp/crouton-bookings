import { getBookingsEmailTemplatesByIds } from '../../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { sendEmail } from '@@/server/services/email'
import { renderTemplate } from '@@/server/services/booking-emails'

export default defineEventHandler(async (event) => {
  const { emailtemplateId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  if (!emailtemplateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email template ID is required'
    })
  }

  // Get the template
  const templates = await getBookingsEmailTemplatesByIds(team.id, [emailtemplateId])
  const template = templates[0]

  if (!template) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Email template not found'
    })
  }

  // Sample test variables
  const variables = {
    customer_name: user.name || 'Test Customer',
    customer_email: user.email,
    booking_date: 'Monday, December 16, 2025',
    booking_slot: '10:00 AM - 11:00 AM',
    location_name: 'Sample Location',
    location_address: '123 Test Street, Test City',
    team_name: team.name
  }

  const renderedSubject = renderTemplate(String(template.subject), variables)
  const renderedBody = renderTemplate(String(template.body), variables)

  await sendEmail({
    to: user.email,
    subject: `[TEST] ${renderedSubject}`,
    html: renderedBody
  })

  return { success: true, sentTo: user.email }
})
