import type { z } from 'zod'
import type { bookingsBookingSchema } from './app/composables/useBookingsBookings'

export interface BookingsBooking {
  id: string
  teamId: string
  owner: string
  location: string
  date: Date | null
  slot: string[] | null
  group?: string
  status: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type BookingsBookingFormData = z.infer<typeof bookingsBookingSchema>
export type NewBookingsBooking = Omit<BookingsBooking, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface BookingsBookingFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: BookingsBooking | Record<string, never> // BookingsBooking for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}