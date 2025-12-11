import type { z } from 'zod'
import type { bookingsPageSchema } from './app/composables/useBookingsPages'

export interface BookingsPage {
  id: string
  teamId: string
  owner: string
  title: string
  slug: string
  content?: string
  excerpt?: string
  metaDescription?: string
  metaTitle?: string
  featuredImageId?: string
  status: string
  publishedAt?: Date | null
  showInMenu?: boolean
  order?: number
  template?: string
  // Hierarchy fields
  parentId?: string | null
  path: string
  depth: number
  // Timestamps
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type BookingsPageFormData = z.infer<typeof bookingsPageSchema>
export type NewBookingsPage = Omit<BookingsPage, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface BookingsPageFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: BookingsPage | Record<string, never> // BookingsPage for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}