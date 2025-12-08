import { z } from 'zod'

export const bookingsEmailTemplateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  subject: z.string().min(1, 'subject is required'),
  body: z.string().min(1, 'body is required'),
  fromEmail: z.string().min(1, 'fromEmail is required'),
  triggerType: z.string().min(1, 'triggerType is required'),
  daysOffset: z.number().optional(),
  locationId: z.string().optional()
})

export const bookingsEmailTemplatesColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'subject', header: 'Subject' },
  { accessorKey: 'body', header: 'Body' },
  { accessorKey: 'fromEmail', header: 'FromEmail' },
  { accessorKey: 'triggerType', header: 'TriggerType' },
  { accessorKey: 'daysOffset', header: 'DaysOffset' },
  { accessorKey: 'locationId', header: 'LocationId' }
]

export const bookingsEmailTemplatesConfig = {
  name: 'bookingsEmailTemplates',
  layer: 'bookings',
  apiPath: 'bookings-emailtemplates',
  componentName: 'BookingsEmailTemplatesForm',
  schema: bookingsEmailTemplateSchema,
  defaultValues: {
    name: '',
    subject: '',
    body: '',
    fromEmail: '',
    triggerType: '',
    daysOffset: 0,
    locationId: ''
  },
  columns: bookingsEmailTemplatesColumns,
}

export const useBookingsEmailTemplates = () => bookingsEmailTemplatesConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: bookingsEmailTemplatesConfig.defaultValues,
    schema: bookingsEmailTemplatesConfig.schema,
    columns: bookingsEmailTemplatesConfig.columns,
    collection: bookingsEmailTemplatesConfig.name
  }
}