import type { z } from 'zod'
import type { bookingsSettingSchema } from './app/composables/useBookingsSettings'

export interface BookingsSetting {
  id: string
  teamId: string
  owner: string
  statuses?: any[]
  enableGroups?: boolean
  groups?: any[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type BookingsSettingFormData = z.infer<typeof bookingsSettingSchema>
export type NewBookingsSetting = Omit<BookingsSetting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface BookingsSettingFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: BookingsSetting | Record<string, never> // BookingsSetting for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}