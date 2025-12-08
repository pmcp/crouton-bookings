import { z } from 'zod'

export const bookingsLocationSchema = z.object({
  title: z.string().min(1, 'title is required'),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(),
  content: z.string().optional(),
  allowedMemberIds: z.array(z.string()).optional(),
  slots: z.array(z.any()).optional()
})

export const bookingsLocationsColumns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'street', header: 'Street' },
  { accessorKey: 'zip', header: 'Zip' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'content', header: 'Content' },
  { accessorKey: 'allowedMemberIds', header: 'AllowedMemberIds' },
  { accessorKey: 'slots', header: 'Slots' }
]

export const bookingsLocationsConfig = {
  name: 'bookingsLocations',
  layer: 'bookings',
  apiPath: 'bookings-locations',
  componentName: 'BookingsLocationsForm',
  schema: bookingsLocationSchema,
  defaultValues: {
    title: '',
    street: '',
    zip: '',
    city: '',
    location: '',
    content: '',
    allowedMemberIds: [],
    slots: []
  },
  columns: bookingsLocationsColumns,
  dependentFieldComponents: {
    slots: 'BookingsLocationsSlotSelect'
  },
}

export const useBookingsLocations = () => bookingsLocationsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: bookingsLocationsConfig.defaultValues,
    schema: bookingsLocationsConfig.schema,
    columns: bookingsLocationsConfig.columns,
    collection: bookingsLocationsConfig.name
  }
}