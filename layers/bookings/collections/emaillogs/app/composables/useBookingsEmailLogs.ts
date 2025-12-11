import { z } from 'zod'

export const bookingsEmailLogSchema = z.object({
  bookingId: z.string().optional(),
  templateId: z.string().optional(),
  recipientEmail: z.string().min(1, 'recipientEmail is required'),
  triggerType: z.string().min(1, 'triggerType is required'),
  status: z.string().min(1, 'status is required'),
  sentAt: z.string().optional(),
  error: z.string().optional()
})

export const bookingsEmailLogsColumns = [
  { accessorKey: 'bookingId', header: 'BookingId' },
  { accessorKey: 'templateId', header: 'TemplateId' },
  { accessorKey: 'recipientEmail', header: 'RecipientEmail' },
  { accessorKey: 'triggerType', header: 'TriggerType' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'sentAt', header: 'SentAt' },
  { accessorKey: 'error', header: 'Error' }
]

export const bookingsEmailLogsConfig = {
  name: 'bookingsEmailLogs',
  layer: 'bookings',
  apiPath: 'bookings-emaillogs',
  componentName: 'BookingsEmailLogsForm',
  schema: bookingsEmailLogSchema,
  defaultValues: {
    bookingId: '',
    templateId: '',
    recipientEmail: '',
    triggerType: '',
    status: '',
    sentAt: '',
    error: ''
  },
  columns: bookingsEmailLogsColumns,
}

export const useBookingsEmailLogs = () => bookingsEmailLogsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: bookingsEmailLogsConfig.defaultValues,
    schema: bookingsEmailLogsConfig.schema,
    columns: bookingsEmailLogsConfig.columns,
    collection: bookingsEmailLogsConfig.name
  }
}