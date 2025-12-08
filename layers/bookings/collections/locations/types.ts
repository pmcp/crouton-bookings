import type { z } from 'zod'
import type { bookingsLocationSchema } from './app/composables/useBookingsLocations'

export interface BookingsLocation {
  id: string
  teamId: string
  owner: string
  title: string
  street?: string
  zip?: string
  city?: string
  location?: string
  content?: string
  allowedMemberIds?: string[]
  slots?: any[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type BookingsLocationFormData = z.infer<typeof bookingsLocationSchema>
export type NewBookingsLocation = Omit<BookingsLocation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface BookingsLocationFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: BookingsLocation | Record<string, never> // BookingsLocation for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}