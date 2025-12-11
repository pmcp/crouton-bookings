import type { z } from 'zod'
import type { bookingsEmailLogSchema } from './app/composables/useBookingsEmailLogs'

export interface BookingsEmailLog {
  id: string
  bookingId?: string
  templateId?: string
  recipientEmail: string
  triggerType: string
  status: string
  sentAt?: string
  error?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type BookingsEmailLogFormData = z.infer<typeof bookingsEmailLogSchema>
export type NewBookingsEmailLog = Omit<BookingsEmailLog, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface BookingsEmailLogFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: BookingsEmailLog | Record<string, never> // BookingsEmailLog for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}