# Email Flows - Progress Tracker

> **For new agents**: Read this file first, check the Quick Stats, and continue from the next uncompleted task.

## Quick Stats

| Metric | Value |
|--------|-------|
| Tasks Completed | 2 / 10 |
| Current Phase | Phase 1: Schema & Config |
| Status | In Progress |

---

## Overview

Build a booking email system where team admins can create email templates that are sent automatically at configurable trigger points.

**Key Decisions**:
- Trigger Types: `booking_confirmed`, `reminder_before`, `booking_cancelled`, `follow_up_after`
- Recipients: Configurable per template (customer, admin, or both)
- Scheduling: API endpoint callable by external cron (flexible for NuxtHub changes)
- Provider: Resend via existing `use-email` abstraction
- Editor: Rich text via nuxt-crouton-editor (TipTap-based)

---

## Phase 1: Schema & Config (3 tasks)

**Progress**: 2/3 tasks (67%)

### Task 1.1: Update Email Template Schema
- [x] ✅ Update `schemas/email-template-schema.json`

**Changes to make:**
```json
{
  "body": {
    "type": "richtext",
    "meta": {
      "required": true,
      "translatable": true,
      "label": "Email Body",
      "help": "Variables: {{customer_name}}, {{booking_date}}, {{booking_slot}}, {{location_name}}, {{location_address}}, {{team_name}}",
      "area": "main",
      "group": "content"
    }
  },
  "triggerType": {
    "type": "string",
    "meta": {
      "required": true,
      "label": "Trigger Type",
      "options": ["booking_confirmed", "reminder_before", "booking_cancelled", "follow_up_after"],
      "displayAs": "optionsSelect",
      "area": "sidebar",
      "group": "configuration"
    }
  },
  "recipientType": {
    "type": "string",
    "meta": {
      "required": true,
      "default": "customer",
      "label": "Send To",
      "options": ["customer", "admin", "both"],
      "displayAs": "optionsSelect",
      "area": "sidebar",
      "group": "configuration"
    }
  },
  "isActive": {
    "type": "boolean",
    "meta": {
      "default": true,
      "label": "Active",
      "area": "sidebar",
      "group": "configuration"
    }
  },
  "hoursOffset": {
    "type": "number",
    "meta": {
      "default": 0,
      "label": "Hours Offset",
      "help": "Negative = before booking, Positive = after booking",
      "area": "sidebar",
      "group": "configuration"
    }
  }
}
```

---

### Task 1.2: Create Email Log Schema
- [x] ✅ Create `schemas/email-log-schema.json`

**New file:**
```json
{
  "bookingId": {
    "type": "string",
    "refTarget": "bookings",
    "meta": {
      "label": "Booking",
      "area": "main"
    }
  },
  "templateId": {
    "type": "string",
    "refTarget": "emailTemplates",
    "meta": {
      "label": "Template",
      "area": "main"
    }
  },
  "recipientEmail": {
    "type": "string",
    "meta": {
      "required": true,
      "label": "Recipient Email",
      "area": "main"
    }
  },
  "triggerType": {
    "type": "string",
    "meta": {
      "required": true,
      "label": "Trigger Type",
      "area": "main"
    }
  },
  "status": {
    "type": "string",
    "meta": {
      "required": true,
      "default": "pending",
      "label": "Status",
      "options": ["pending", "sent", "failed"],
      "displayAs": "optionsSelect",
      "area": "sidebar"
    }
  },
  "sentAt": {
    "type": "timestamp",
    "meta": {
      "label": "Sent At",
      "area": "sidebar"
    }
  },
  "error": {
    "type": "text",
    "meta": {
      "label": "Error Message",
      "area": "main"
    }
  }
}
```

---

### Task 1.3: Update Crouton Config
- [ ] Update `crouton.config.mjs` to include emailLogs collection
- [ ] Run `pnpm crouton generate`
- [ ] Run migrations

**Add to collections array:**
```javascript
{ name: 'emailLogs', fieldsFile: './schemas/email-log-schema.json' }
```

**Add to targets[0].collections:**
```javascript
collections: ['bookings', 'locations', 'emailTemplates', 'emailLogs', 'pages', 'assets', 'settings']
```

---

## Phase 2: Email Service (3 tasks)

**Progress**: 0/3 tasks (0%)

### Task 2.1: Create Booking Email Service
- [ ] Create `server/services/booking-emails.ts`

**Functions to implement:**
- `getActiveTemplatesForTrigger(teamId, triggerType, locationId?)` - Query active templates
- `renderTemplate(template, booking, location, customer)` - Variable substitution
- `sendBookingEmail(booking, triggerType)` - Main send function
- `logEmailSend(bookingId, templateId, email, status, error?)` - Audit logging

**Variable Mapping:**
| Variable | Source |
|----------|--------|
| `{{customer_name}}` | booking.ownerUser.name |
| `{{customer_email}}` | booking.ownerUser.email |
| `{{booking_date}}` | formatted booking.date |
| `{{booking_slot}}` | booking.slot |
| `{{location_name}}` | booking.locationData.name |
| `{{location_address}}` | booking.locationData.address |
| `{{team_name}}` | team.name |

---

### Task 2.2: Create Vue Email Component
- [ ] Create `emails/booking-notification.vue`

**Template structure:**
```vue
<script setup lang="ts">
interface Props {
  subject: string
  bodyHtml: string  // Already rendered with variables
  teamName: string
  teamLogo?: string
}
</script>
```

Follow existing pattern from `emails/member-invite.vue`

---

### Task 2.3: Add CRON_SECRET to Environment
- [ ] Update `env.ts` to include CRON_SECRET
- [ ] Add to `.env.example`

```typescript
CRON_SECRET: z.string().min(32).optional(),
```

---

## Phase 3: Event Hooks (2 tasks)

**Progress**: 0/2 tasks (0%)

### Task 3.1: Hook Booking Creation
- [ ] Modify `layers/bookings/collections/bookings/server/api/teams/[id]/bookings-bookings/index.post.ts`

**Add after successful booking creation:**
```typescript
import { sendBookingEmail } from '@@/server/services/booking-emails'

// After createBookingsBooking()
await sendBookingEmail(booking, 'booking_confirmed')
```

---

### Task 3.2: Hook Booking Cancellation
- [ ] Modify booking update/delete endpoints to trigger `booking_cancelled`

**Location:** Check for status change to 'cancelled' or deletion

---

## Phase 4: Scheduled Emails (2 tasks)

**Progress**: 0/2 tasks (0%)

### Task 4.1: Create Scheduled Email Task
- [ ] Create `server/tasks/process-scheduled-emails.ts`

**Logic:**
1. Get all teams with active reminder/follow-up templates
2. For reminders: Find bookings where `date - hoursOffset = now`
3. For follow-ups: Find bookings where `date + hoursOffset = now`
4. Check email log to avoid duplicates
5. Send emails and log results

---

### Task 4.2: Create Cron API Endpoint
- [ ] Create `server/api/cron/process-emails.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-cron-secret')
  if (secret !== env.CRON_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return await runTask('process-scheduled-emails')
})
```

---

## File Summary

| Action | File | Task |
|--------|------|------|
| Modify | `schemas/email-template-schema.json` | 1.1 |
| Create | `schemas/email-log-schema.json` | 1.2 |
| Modify | `crouton.config.mjs` | 1.3 |
| Create | `server/services/booking-emails.ts` | 2.1 |
| Create | `emails/booking-notification.vue` | 2.2 |
| Modify | `env.ts` | 2.3 |
| Modify | `layers/bookings/.../index.post.ts` | 3.1 |
| Modify | Booking update/delete endpoints | 3.2 |
| Create | `server/tasks/process-scheduled-emails.ts` | 4.1 |
| Create | `server/api/cron/process-emails.get.ts` | 4.2 |

---

## Reference: Existing Patterns

**Email Service** (`server/services/email.ts`):
```typescript
import { sendEmail } from '@@/server/services/email'
await sendEmail({ to, subject, html })
```

**Booking Queries** (`layers/bookings/.../queries.ts`):
- `getAllBookingsBookings(teamId)` - Returns bookings with ownerUser, locationData
- `getBookingsBookingsByIds(teamId, bookingIds)` - Same with ID filter

**Vue Email Pattern** (`emails/member-invite.vue`):
- Uses `@vue-email/components` (Body, Container, Head, etc.)
- Uses `@vue-email/render` to convert to HTML
- Access `env` from `@@/env`

**Nitro Task Pattern** (`server/tasks/sync-stripe-data.ts`):
```typescript
export default defineTask({
  meta: { name: 'task-name', description: '...' },
  async run() { /* logic */ return { result: { success: true } } }
})
```

---

## Daily Log

### 2025-12-11 - Claude Opus 4.5
- Tasks completed: Plan created, Task 1.1, Task 1.2
- Notes: Updated email-template-schema.json with richtext body, trigger options, recipientType, isActive, and hoursOffset fields. Created email-log-schema.json for tracking sent emails with booking/template references, recipient, status, and error fields.
