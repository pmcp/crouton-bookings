import { z } from 'zod'
import { validateTeamOwnership } from '@@/server/utils/teamValidation.ts'
import { validateBody } from '@@/server/utils/bodyValidation'
import { useDB, tables, eq } from '@@/server/utils/database'
import { generateAlphaNumericCode } from '@@/server/utils/nanoid'

const addDomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .transform((d) => d.toLowerCase().trim())
    .refine(
      (d) => /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(d),
      'Invalid domain format',
    ),
})

export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'id')
  if (!teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID is required',
    })
  }

  await validateTeamOwnership(event, teamId)

  const body = await validateBody(event, addDomainSchema)

  const db = useDB()

  // Check if domain already exists
  const existingDomain = await db
    .select()
    .from(tables.domains)
    .where(eq(tables.domains.domain, body.domain))
    .get()

  if (existingDomain) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Domain is already registered',
    })
  }

  // Generate verification token
  const verificationToken = generateAlphaNumericCode(32)

  // Check if this is the first domain for the team (make it primary)
  const existingTeamDomains = await db
    .select()
    .from(tables.domains)
    .where(eq(tables.domains.teamId, teamId))

  const isPrimary = existingTeamDomains.length === 0

  // Create domain record
  const [domain] = await db
    .insert(tables.domains)
    .values({
      teamId,
      domain: body.domain,
      status: 'pending',
      verificationToken,
      isPrimary,
    })
    .returning()

  setResponseStatus(event, 201)
  return domain
})
