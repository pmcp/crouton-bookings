import { validateTeamOwnership } from '@@/server/utils/teamValidation.ts'
import { useDB, tables, eq, and } from '@@/server/utils/database'

export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'id')
  const domainId = getRouterParam(event, 'domainId')

  if (!teamId || !domainId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID and domain ID are required',
    })
  }

  await validateTeamOwnership(event, teamId)

  const db = useDB()

  // Get the domain record
  const domain = await db
    .select()
    .from(tables.domains)
    .where(and(eq(tables.domains.id, domainId), eq(tables.domains.teamId, teamId)))
    .get()

  if (!domain) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Domain not found',
    })
  }

  // Check DNS TXT record
  const txtRecordName = `_crouton-verification.${domain.domain}`

  try {
    // Use Cloudflare's DNS over HTTPS API for DNS lookup
    const dnsResponse = await $fetch<{
      Status: number
      Answer?: Array<{ data: string }>
    }>(`https://cloudflare-dns.com/dns-query?name=${txtRecordName}&type=TXT`, {
      headers: {
        Accept: 'application/dns-json',
      },
    })

    if (dnsResponse.Status !== 0 || !dnsResponse.Answer) {
      // DNS lookup failed or no TXT records found
      await db
        .update(tables.domains)
        .set({ status: 'failed' })
        .where(eq(tables.domains.id, domainId))

      return {
        verified: false,
        message: 'No TXT record found. Please add the DNS record and try again.',
        expectedRecord: {
          type: 'TXT',
          name: txtRecordName,
          value: domain.verificationToken,
        },
      }
    }

    // Check if any TXT record contains the verification token
    const verified = dnsResponse.Answer.some((record) => {
      // DNS TXT records are often quoted, so strip quotes
      const recordValue = record.data.replace(/^"|"$/g, '')
      return recordValue === domain.verificationToken
    })

    if (verified) {
      await db
        .update(tables.domains)
        .set({ status: 'verified', verifiedAt: new Date() })
        .where(eq(tables.domains.id, domainId))

      return {
        verified: true,
        message: 'Domain verified successfully!',
      }
    }

    // Token not found in any record
    await db
      .update(tables.domains)
      .set({ status: 'failed' })
      .where(eq(tables.domains.id, domainId))

    return {
      verified: false,
      message: 'TXT record found but verification token does not match.',
      expectedRecord: {
        type: 'TXT',
        name: txtRecordName,
        value: domain.verificationToken,
      },
    }
  } catch (error) {
    console.error('DNS verification error:', error)

    return {
      verified: false,
      message: 'Failed to perform DNS lookup. Please try again later.',
      expectedRecord: {
        type: 'TXT',
        name: txtRecordName,
        value: domain.verificationToken,
      },
    }
  }
})
