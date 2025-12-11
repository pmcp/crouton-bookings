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

// Use shared data from composable (same cache key as tab count)
const {
  myBookings: bookings,
  myBookingsStatus: status,
  refreshMyBookings: refresh,
  activeTab,
  cancelBooking,
} = useBookingCart()

// Track which booking is being cancelled
const cancellingId = ref<string | null>(null)

// Cancel booking with confirmation
async function handleCancel(booking: Booking) {
  // Simple confirm dialog
  if (!confirm(`Cancel booking at ${booking.locationData?.title || 'Unknown'} on ${formatDate(booking.date)}?`)) {
    return
  }

  cancellingId.value = booking.id
  await cancelBooking(booking.id)
  cancellingId.value = null
}

const hasBookings = computed(() => bookings.value && bookings.value.length > 0)

// Get upcoming bookings (future dates only)
const upcomingBookings = computed(() => {
  if (!bookings.value) return []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return (bookings.value as Booking[]).filter((b) => {
    const bookingDate = new Date(b.date)
    return bookingDate >= now
  })
})

// Format date for display
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

// Get slot label from booking
function getSlotLabel(booking: Booking): string {
  if (!booking.slot || !booking.locationData?.slots) return '-'

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

  // Check for all-day first
  if (bookingSlotIds.includes('all-day')) return 'All Day'

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

function goToBooking() {
  activeTab.value = 'book'
}
</script>

<template>
  <div class="p-4 flex flex-col h-full min-h-0 overflow-hidden">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="flex-1 flex flex-col items-center justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-gray-400 animate-spin mb-2" />
      <p class="text-sm text-gray-500">
        Loading...
      </p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasBookings" class="flex-1 flex flex-col items-center justify-center text-center py-8">
      <UIcon name="i-lucide-calendar-x" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
      <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
        No bookings yet
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Create your first booking to get started
      </p>
      <UButton
        variant="soft"
        size="sm"
        icon="i-lucide-plus"
        @click="goToBooking"
      >
        Book Now
      </UButton>
    </div>

    <!-- Bookings list -->
    <template v-else>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          {{ upcomingBookings.length }} upcoming
        </h3>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-lucide-refresh-cw"
          @click="() => refresh()"
        />
      </div>

      <!-- Items List -->
      <div class="flex-1 min-h-0 overflow-y-auto space-y-2">
        <div
          v-for="booking in upcomingBookings"
          :key="booking.id"
          class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-calendar-check" class="w-4 h-4 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ booking.locationData?.title || 'Unknown' }}
                </p>
                <div class="flex items-center gap-1">
                  <UBadge :color="getStatusColor(booking.status)" variant="subtle" size="xs">
                    {{ booking.status }}
                  </UBadge>
                  <!-- Cancel button (only for non-cancelled bookings) -->
                  <UButton
                    v-if="booking.status !== 'cancelled'"
                    variant="ghost"
                    color="error"
                    size="xs"
                    icon="i-lucide-x"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :loading="cancellingId === booking.id"
                    @click="handleCancel(booking)"
                  />
                </div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ formatDate(booking.date) }} at {{ getSlotLabel(booking) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Show message if no upcoming but has past bookings -->
        <div v-if="upcomingBookings.length === 0 && hasBookings" class="text-center py-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            No upcoming bookings
          </p>
          <UButton
            variant="link"
            size="xs"
            class="mt-2"
            @click="goToBooking"
          >
            Book a new slot
          </UButton>
        </div>
      </div>
    </template>
  </div>
</template>
