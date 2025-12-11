import type { z } from 'zod'
import type { bookingsEmailTemplateSchema } from './app/composables/useBookingsEmailTemplates'

export interface BookingsEmailTemplate {
  id: string
  teamId: string
  owner: string
  name: string
  subject: string
  body: string
  fromEmail: string
  triggerType: string
  recipientType: string
  isActive?: boolean
  hoursOffset?: number
  locationId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type BookingsEmailTemplateFormData = z.infer<typeof bookingsEmailTemplateSchema>
export type NewBookingsEmailTemplate = Omit<BookingsEmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface BookingsEmailTemplateFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: BookingsEmailTemplate | Record<string, never> // BookingsEmailTemplate for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}