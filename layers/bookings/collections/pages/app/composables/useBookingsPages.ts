import { z } from 'zod'

export const bookingsPageSchema = z.object({
  title: z.string().min(1, 'title is required'),
  slug: z.string().min(1, 'slug is required'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  metaDescription: z.string().optional(),
  metaTitle: z.string().optional(),
  featuredImageId: z.string().optional(),
  status: z.string().min(1, 'status is required'),
  publishedAt: z.date().optional(),
  showInMenu: z.boolean().optional(),
  order: z.number().optional(),
  template: z.string().optional()
})

export const bookingsPagesColumns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'content', header: 'Content' },
  { accessorKey: 'excerpt', header: 'Excerpt' },
  { accessorKey: 'metaDescription', header: 'MetaDescription' },
  { accessorKey: 'metaTitle', header: 'MetaTitle' },
  { accessorKey: 'featuredImageId', header: 'FeaturedImageId' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'publishedAt', header: 'PublishedAt' },
  { accessorKey: 'showInMenu', header: 'ShowInMenu' },
  { accessorKey: 'order', header: 'Order' },
  { accessorKey: 'template', header: 'Template' }
]

export const bookingsPagesConfig = {
  name: 'bookingsPages',
  layer: 'bookings',
  apiPath: 'bookings-pages',
  componentName: 'BookingsPagesForm',
  schema: bookingsPageSchema,
  defaultValues: {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaDescription: '',
    metaTitle: '',
    featuredImageId: '',
    status: '',
    publishedAt: null,
    showInMenu: false,
    order: 0,
    template: ''
  },
  columns: bookingsPagesColumns,
}

export const useBookingsPages = () => bookingsPagesConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: bookingsPagesConfig.defaultValues,
    schema: bookingsPagesConfig.schema,
    columns: bookingsPagesConfig.columns,
    collection: bookingsPagesConfig.name
  }
}