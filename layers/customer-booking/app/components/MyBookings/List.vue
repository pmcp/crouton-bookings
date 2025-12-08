<script setup lang="ts">
interface SlotItem {
  id: string
  label?: string
  value?: string
}

interface Booking {
  id: string
  location: string
  date: string | Date
  slot: string[] | string | null
  status: string
  createdAt: string | Date
  locationData?: {
    id: string
    title: string
    street?: string
    city?: string
    slots?: SlotItem[] | string
  }
}

const route = useRoute()
const teamId = computed(() => route.params.team as string)

const { data: bookings, status, refresh } = useFetch<Booking[]>(
  () => `/api/teams/${teamId.value}/customer-bookings`,
  {
    key: 'customer-bookings',
  },
)

const hasBookings = computed(() => bookings.value && bookings.value.length > 0)

// Format date for display
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

// Get slot label from booking
function getSlotLabel(booking: Booking): string {
  if (!booking.slot || !booking.locationData?.slots) return '-'

  // Parse slots from location
  let locationSlots: SlotItem[]
  try {
    locationSlots = typeof booking.locationData.slots === 'string'
      ? JSON.parse(booking.locationData.slots)
      : booking.locationData.slots
  }
  catch {
    return '-'
  }

  if (!Array.isArray(locationSlots)) return '-'

  // Parse slot IDs from booking
  let bookingSlotIds: string[]
  try {
    bookingSlotIds = typeof booking.slot === 'string'
      ? JSON.parse(booking.slot)
      : booking.slot
  }
  catch {
    return '-'
  }

  if (!Array.isArray(bookingSlotIds) || bookingSlotIds.length === 0) return '-'

  // Find matching slot
  const slot = locationSlots.find(s => bookingSlotIds.includes(s.id))
  return slot?.label || slot?.value || '-'
}

// Status badge color
function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'neutral'
  }
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="status === 'pending'" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
      <p class="text-gray-500">
        Loading your bookings...
      </p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasBookings" class="text-center py-12">
      <UIcon name="i-lucide-calendar-x" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No bookings yet
      </h3>
      <p class="text-gray-500 mb-6">
        You haven't made any bookings yet. Create your first one!
      </p>
      <UButton :to="`/dashboard/${teamId}/bookings/new`">
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-2" />
        Book Now
      </UButton>
    </div>

    <!-- Bookings list -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between mb-6">
        <p class="text-sm text-gray-500">
          {{ bookings?.length }} booking{{ bookings?.length === 1 ? '' : 's' }}
        </p>
        <UButton variant="outline" size="sm" @click="() => refresh()">
          <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2" />
          Refresh
        </UButton>
      </div>

      <UCard v-for="booking in bookings" :key="booking.id">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-calendar-check" class="w-6 h-6 text-primary" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ booking.locationData?.title || 'Unknown Location' }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ formatDate(booking.date) }} at {{ getSlotLabel(booking) }}
                </p>
              </div>
              <UBadge :color="getStatusColor(booking.status)" variant="subtle">
                {{ booking.status }}
              </UBadge>
            </div>

            <div v-if="booking.locationData?.city" class="mt-2">
              <p class="text-xs text-gray-400">
                <UIcon name="i-lucide-map-pin" class="w-3 h-3 inline mr-1" />
                {{ [booking.locationData.street, booking.locationData.city].filter(Boolean).join(', ') }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
