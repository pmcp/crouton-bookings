import { z } from 'zod'

export const bookingsAssetSchema = z.object({
  filename: z.string().min(1, 'filename is required'),
  pathname: z.string().min(1, 'pathname is required'),
  contentType: z.string().optional(),
  size: z.number().optional(),
  alt: z.string().optional(),
  uploadedAt: z.date().optional()
})

export const bookingsAssetsColumns = [
  { accessorKey: 'filename', header: 'Filename' },
  { accessorKey: 'pathname', header: 'Pathname' },
  { accessorKey: 'contentType', header: 'ContentType' },
  { accessorKey: 'size', header: 'Size' },
  { accessorKey: 'alt', header: 'Alt' },
  { accessorKey: 'uploadedAt', header: 'UploadedAt' }
]

export const bookingsAssetsConfig = {
  name: 'bookingsAssets',
  layer: 'bookings',
  apiPath: 'bookings-assets',
  componentName: 'BookingsAssetsForm',
  schema: bookingsAssetSchema,
  defaultValues: {
    filename: '',
    pathname: '',
    contentType: '',
    size: 0,
    alt: '',
    uploadedAt: null
  },
  columns: bookingsAssetsColumns,
}

export const useBookingsAssets = () => bookingsAssetsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: bookingsAssetsConfig.defaultValues,
    schema: bookingsAssetsConfig.schema,
    columns: bookingsAssetsConfig.columns,
    collection: bookingsAssetsConfig.name
  }
}