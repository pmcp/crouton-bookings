<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate, getLocalTimeZone, toCalendarDate, fromDate } from '@internationalized/date'

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

type StatusKey = 'confirmed' | 'pending' | 'cancelled'

const route = useRoute()
const teamId = computed(() => route.params.team as string)

const { data: bookings, status, refresh } = useFetch<Booking[]>(
  () => `/api/teams/${teamId.value}/customer-bookings`,
  {
    key: 'customer-bookings',
  },
)

// Status filter state - all enabled by default
const statusFilters = ref<Record<StatusKey, boolean>>({
  confirmed: true,
  pending: true,
  cancelled: false,
})

// Toggle status filter
function toggleStatus(key: StatusKey) {
  statusFilters.value[key] = !statusFilters.value[key]
}

// Get all unique statuses from bookings
const availableStatuses = computed<StatusKey[]>(() => {
  if (!bookings.value) return []
  const statuses = new Set<StatusKey>()
  bookings.value.forEach((b) => {
    const s = b.status?.toLowerCase() as StatusKey
    if (s) statuses.add(s)
  })
  return Array.from(statuses)
})

// Filtered bookings based on status
const filteredBookings = computed(() => {
  if (!bookings.value) return []
  return bookings.value.filter((b) => {
    const s = b.status?.toLowerCase() as StatusKey
    return statusFilters.value[s] !== false
  })
})

// Calendar - selected date to highlight bookings
const selectedCalendarDate = ref<DateValue | undefined>()

// Get dates that have bookings for calendar highlighting
function hasBookingOnDate(date: DateValue): boolean {
  if (!bookings.value) return false
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return bookings.value.some((b) => {
    const bookingDate = new Date(b.date)
    const bookingStr = bookingDate.toISOString().substring(0, 10)
    return bookingStr === dateStr
  })
}

// Get booking status for a date (for coloring the chip)
function getBookingStatusForDate(date: DateValue): StatusKey | null {
  if (!bookings.value) return null
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  const booking = bookings.value.find((b) => {
    const bookingDate = new Date(b.date)
    const bookingStr = bookingDate.toISOString().substring(0, 10)
    return bookingStr === dateStr
  })
  return booking?.status?.toLowerCase() as StatusKey | null
}

// Get chip color based on status
function getChipColorForDate(date: DateValue): 'success' | 'warning' | 'error' | undefined {
  const status = getBookingStatusForDate(date)
  if (!status) return undefined
  switch (status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    default: return undefined
  }
}

// Get bookings for a specific date
function getBookingsForDate(date: DateValue): Booking[] {
  if (!bookings.value) return []
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return bookings.value.filter((b) => {
    const bookingDate = new Date(b.date)
    const bookingStr = bookingDate.toISOString().substring(0, 10)
    return bookingStr === dateStr
  })
}

// Tooltip text for dates with bookings
function getTooltipForDate(date: DateValue): string {
  const dateBookings = getBookingsForDate(date)
  if (dateBookings.length === 0) return ''
  return dateBookings.map(b => b.locationData?.title || 'Booking').join(', ')
}

// When calendar date is selected, scroll to / highlight those bookings
watch(selectedCalendarDate, (newDate) => {
  if (!newDate) return
  // Could implement scroll-to-booking functionality here
})

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
    <div v-else class="space-y-6">
      <!-- Calendar and Filters Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar -->
        <UCard class="lg:col-span-1">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-500" />
              <span class="text-sm font-medium">Calendar View</span>
            </div>
          </template>
          <UCalendar
            v-model="selectedCalendarDate"
            size="sm"
            color="primary"
            variant="subtle"
          >
            <template #day="{ day }">
              <UTooltip
                v-if="hasBookingOnDate(day)"
                :text="getTooltipForDate(day)"
                :delay-duration="200"
              >
                <UChip
                  :color="getChipColorForDate(day)"
                  size="2xs"
                  :show="hasBookingOnDate(day)"
                >
                  {{ day.day }}
                </UChip>
              </UTooltip>
              <span v-else>{{ day.day }}</span>
            </template>
          </UCalendar>
          <!-- Legend -->
          <div class="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
            <div class="flex items-center gap-1">
              <UChip color="success" size="xs" standalone inset />
              <span>Confirmed</span>
            </div>
            <div class="flex items-center gap-1">
              <UChip color="warning" size="xs" standalone inset />
              <span>Pending</span>
            </div>
            <div class="flex items-center gap-1">
              <UChip color="error" size="xs" standalone inset />
              <span>Cancelled</span>
            </div>
          </div>
        </UCard>

        <!-- Status Filters + List -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Header with count and refresh -->
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">
              {{ filteredBookings.length }} of {{ bookings?.length }} booking{{ bookings?.length === 1 ? '' : 's' }}
            </p>
            <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-refresh-cw" @click="() => refresh()" />
          </div>

          <!-- Status Filter Toggles -->
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="statusKey in (['confirmed', 'pending', 'cancelled'] as StatusKey[])"
              :key="statusKey"
              size="xs"
              :variant="statusFilters[statusKey] ? 'soft' : 'outline'"
              :color="getStatusColor(statusKey)"
              @click="toggleStatus(statusKey)"
            >
              <UIcon
                :name="statusFilters[statusKey] ? 'i-lucide-check' : 'i-lucide-x'"
                class="w-3 h-3 mr-1"
              />
              {{ statusKey }}
            </UButton>
          </div>

          <!-- Bookings List -->
          <div class="space-y-3">
            <UCard v-for="booking in filteredBookings" :key="booking.id">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UIcon name="i-lucide-calendar-check" class="w-6 h-6 text-primary" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                        {{ booking.locationData?.title || 'Unknown Location' }}
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
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

            <!-- Empty state when filtered -->
            <div v-if="filteredBookings.length === 0" class="text-center py-8">
              <UIcon name="i-lucide-filter-x" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-sm text-gray-500">No bookings match the selected filters</p>
              <UButton
                variant="link"
                size="sm"
                class="mt-2"
                @click="statusFilters = { confirmed: true, pending: true, cancelled: true }"
              >
                Show all bookings
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
