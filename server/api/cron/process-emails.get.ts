import { consola } from 'consola'
import { env } from '@@/env'

export default defineEventHandler(async (event) => {
  // Validate CRON_SECRET header
  const secret = getHeader(event, 'x-cron-secret')

  if (!env.CRON_SECRET) {
    consola.warn('CRON_SECRET not configured - cron endpoint disabled')
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: 'Cron endpoint not configured',
    })
  }

  if (secret !== env.CRON_SECRET) {
    consola.warn('Invalid CRON_SECRET provided')
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid cron secret',
    })
  }

  consola.start('Cron: Processing scheduled emails...')

  try {
    const result = await runTask('process-scheduled-emails')

    consola.success('Cron: Scheduled email processing completed')

    return {
      success: true,
      timestamp: new Date().toISOString(),
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    consola.error('Cron: Failed to process scheduled emails:', errorMessage)

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: `Failed to process scheduled emails: ${errorMessage}`,
    })
  }
})
