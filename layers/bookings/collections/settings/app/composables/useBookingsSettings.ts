import { z } from 'zod'

export const bookingsSettingSchema = z.object({
  statuses: z.array(z.any()).optional(),
  groups: z.array(z.any()).optional()
})

export const bookingsSettingsColumns = [
  { accessorKey: 'statuses', header: 'Statuses' },
  { accessorKey: 'groups', header: 'Groups' }
]

export const bookingsSettingsConfig = {
  name: 'bookingsSettings',
  layer: 'bookings',
  apiPath: 'bookings-settings',
  componentName: 'BookingsSettingsForm',
  schema: bookingsSettingSchema,
  defaultValues: {
    statuses: [],
    groups: []
  },
  columns: bookingsSettingsColumns,
  dependentFieldComponents: {
    statuses: 'BookingsSettingsStatuseSelect',
    groups: 'BookingsSettingsGroupSelect'
  },
}

export const useBookingsSettings = () => bookingsSettingsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: bookingsSettingsConfig.defaultValues,
    schema: bookingsSettingsConfig.schema,
    columns: bookingsSettingsConfig.columns,
    collection: bookingsSettingsConfig.name
  }
}