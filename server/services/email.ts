import { useEmail } from 'use-email'
import { env } from '@@/env'

const EMAIL_PROVIDER = env.EMAIL_PROVIDER
const emailService = useEmail(EMAIL_PROVIDER)

export interface BaseEmailPayload {
  to: string | string[]
  subject: string
}

export interface TextEmailPayload extends BaseEmailPayload {
  text: string
  html?: string
}

export interface HtmlEmailPayload extends BaseEmailPayload {
  text?: string
  html: string
}

export type EmailPayload = TextEmailPayload | HtmlEmailPayload

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
  // Mock mode: log to console instead of sending
  if (env.MOCK_EMAIL) {
    console.log('\n📧 [MOCK EMAIL]')
    console.table({
      from: env.FROM_EMAIL,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
    })
    if (text) console.log('Text:', text.substring(0, 200) + (text.length > 200 ? '...' : ''))
    if (html) console.log('HTML:', html.substring(0, 200) + (html.length > 200 ? '...' : ''))
    console.log('')
    return
  }

  try {
    await emailService.send({
      from: env.FROM_EMAIL,
      to,
      subject,
      text,
      html,
    })
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send email',
    })
  }
}
