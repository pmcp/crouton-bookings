import { z } from 'zod'

export const bookingsBookingSchema = z.object({
  location: z.string().min(1, 'location is required'),
  date: z.date({ required_error: 'date is required' }),
  slot: z.array(z.string()).min(1, 'slot is required'),
  group: z.string().optional(),
  status: z.string().min(1, 'status is required')
})

export const bookingsBookingsColumns = [
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'slot', header: 'Slot' },
  { accessorKey: 'group', header: 'Group' },
  { accessorKey: 'status', header: 'Status' }
]

export const bookingsBookingsConfig = {
  name: 'bookingsBookings',
  layer: 'bookings',
  apiPath: 'bookings-bookings',
  componentName: 'BookingsBookingsForm',
  schema: bookingsBookingSchema,
  defaultValues: {
    location: '',
    date: null,
    slot: null,
    group: '',
    status: ''
  },
  columns: bookingsBookingsColumns,
  dependentFieldComponents: {
    slot: 'BookingsBookingsSlotSelect'
  },
}

export const useBookingsBookings = () => bookingsBookingsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: bookingsBookingsConfig.defaultValues,
    schema: bookingsBookingsConfig.schema,
    columns: bookingsBookingsConfig.columns,
    collection: bookingsBookingsConfig.name
  }
}