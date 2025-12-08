import type { z } from 'zod'
import type { bookingsAssetSchema } from './app/composables/useBookingsAssets'

export interface BookingsAsset {
  id: string
  teamId: string
  owner: string
  filename: string
  pathname: string
  contentType?: string
  size?: number
  alt?: string
  uploadedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type BookingsAssetFormData = z.infer<typeof bookingsAssetSchema>
export type NewBookingsAsset = Omit<BookingsAsset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface BookingsAssetFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: BookingsAsset | Record<string, never> // BookingsAsset for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}