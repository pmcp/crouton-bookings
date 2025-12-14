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
  refreshMyBookings,
  activeTab,
  cancelBooking,
  deleteBooking,
} = useBookingCart()

// Alias for template usage
const refresh = refreshMyBookings

// Track which booking is being cancelled (loading state)
const cancellingId = ref<string | null>(null)

// Track which booking is being deleted (loading state)
const deletingId = ref<string | null>(null)

// Track which booking has confirmation expanded
const confirmingId = ref<string | null>(null)

// Track which booking has delete confirmation expanded
const confirmingDeleteId = ref<string | null>(null)

// Show confirmation for a booking
function showConfirmation(bookingId: string) {
  confirmingId.value = bookingId
  confirmingDeleteId.value = null
}

// Show delete confirmation for a cancelled booking
function showDeleteConfirmation(bookingId: string) {
  confirmingDeleteId.value = bookingId
  confirmingId.value = null
}

// Hide confirmation
function hideConfirmation() {
  confirmingId.value = null
  confirmingDeleteId.value = null
}

// Confirm and cancel booking
async function confirmCancel(bookingId: string) {
  cancellingId.value = bookingId
  await cancelBooking(bookingId)
  cancellingId.value = null
  confirmingId.value = null
}

// Permanently delete a cancelled booking
async function confirmDelete(bookingId: string) {
  deletingId.value = bookingId
  await deleteBooking(bookingId)
  deletingId.value = null
  confirmingDeleteId.value = null
}

const hasBookings = computed(() => bookings.value && bookings.value.length > 0)

// Toggle to show cancelled bookings
const showCancelled = ref(false)

// Get upcoming bookings (future dates)
const upcomingBookings = computed(() => {
  if (!bookings.value) return []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return (bookings.value as Booking[]).filter((b) => {
    const bookingDate = new Date(b.date)
    const isFuture = bookingDate >= now
    const includeCancelled = showCancelled.value || b.status !== 'cancelled'
    return isFuture && includeCancelled
  })
})

// Count of non-cancelled upcoming bookings (for display)
const activeUpcomingCount = computed(() => {
  if (!bookings.value) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return (bookings.value as Booking[]).filter((b) => {
    const bookingDate = new Date(b.date)
    return bookingDate >= now && b.status !== 'cancelled'
  }).length
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
  <div class="p-4 w-full flex flex-col h-full min-h-0 overflow-hidden">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="flex-1 flex flex-col items-center justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-muted animate-spin mb-2" />
      <p class="text-sm text-muted">
        Loading...
      </p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasBookings" class="flex-1 flex flex-col items-center justify-center text-center py-8">
      <UIcon name="i-lucide-calendar-x" class="w-12 h-12 text-muted mb-3" />
      <h3 class="text-sm font-medium mb-1">
        No bookings yet
      </h3>
      <p class="text-xs text-muted mb-4">
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
        <h3 class="text-sm font-medium">
          {{ activeUpcomingCount }} upcoming
        </h3>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
            <USwitch v-model="showCancelled" size="xs" />
            <span>Cancelled</span>
          </label>
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-refresh-cw"
            @click="() => refresh()"
          />
        </div>
      </div>

      <!-- Items List -->
      <div class="flex-1 min-h-0 overflow-y-auto space-y-2">
        <div
          v-for="booking in upcomingBookings"
          :key="booking.id"
          class="bg-elevated/50 rounded-lg group overflow-hidden"
        >
          <!-- Booking info -->
          <div class="p-3">
            <div class="flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{ booking.locationData?.title || 'Unknown' }}
                </p>
                <p class="text-xs text-muted mt-0.5">
                  {{ formatDate(booking.date) }} at {{ getSlotLabel(booking) }}
                </p>
              </div>
              <!-- Status badge + action button (aligned) -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <UBadge :color="getStatusColor(booking.status)" variant="subtle" size="sm">
                  {{ booking.status }}
                </UBadge>
                <!-- Cancel button for non-cancelled bookings -->
                <UButton
                  v-if="booking.status !== 'cancelled' && confirmingId !== booking.id"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  icon="i-lucide-x"
                  class="transition-all duration-200 hover:scale-110 hover:rotate-90 hover:text-error"
                  @click="showConfirmation(booking.id)"
                />
                <!-- Delete button for cancelled bookings -->
                <UButton
                  v-else-if="booking.status === 'cancelled' && confirmingDeleteId !== booking.id"
                  variant="ghost"
                  color="error"
                  size="xs"
                  icon="i-lucide-trash-2"
                  class="transition-all duration-200 hover:scale-110"
                  @click="showDeleteConfirmation(booking.id)"
                />
              </div>
            </div>
          </div>

          <!-- Cancel confirmation (only for non-cancelled bookings) -->
          <div
            v-if="booking.status !== 'cancelled' && confirmingId === booking.id"
            class="px-3 pb-3"
          >
            <div class="flex items-center justify-between gap-2 bg-error/10 rounded-lg px-3 py-2">
              <span class="text-xs text-muted">Cancel this booking?</span>
              <div class="flex items-center gap-2">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="hideConfirmation"
                >
                  Keep
                </UButton>
                <UButton
                  variant="soft"
                  color="error"
                  size="xs"
                  :loading="cancellingId === booking.id"
                  @click="confirmCancel(booking.id)"
                >
                  Cancel
                </UButton>
              </div>
            </div>
          </div>

          <!-- Delete confirmation (only for cancelled bookings) -->
          <div
            v-if="booking.status === 'cancelled' && confirmingDeleteId === booking.id"
            class="px-3 pb-3"
          >
            <div class="flex items-center justify-between gap-2 bg-error/10 rounded-lg px-3 py-2">
              <span class="text-xs text-muted">Delete permanently?</span>
              <div class="flex items-center gap-2">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="hideConfirmation"
                >
                  Keep
                </UButton>
                <UButton
                  variant="soft"
                  color="error"
                  size="xs"
                  :loading="deletingId === booking.id"
                  @click="confirmDelete(booking.id)"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Show message if no upcoming but has past bookings -->
        <div v-if="upcomingBookings.length === 0 && hasBookings" class="text-center py-4">
          <p class="text-xs text-muted">
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
