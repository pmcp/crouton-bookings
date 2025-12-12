<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

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

interface StatusItem {
  id: string
  label: string
  value: string
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

interface BookingsSettings {
  id?: string
  statuses?: StatusItem[]
}

// Default statuses (fallback when no settings configured)
const DEFAULT_STATUSES: StatusItem[] = [
  { id: '1', label: 'Confirmed', value: 'confirmed', color: 'success' },
  { id: '2', label: 'Pending', value: 'pending', color: 'warning' },
  { id: '3', label: 'Cancelled', value: 'cancelled', color: 'error' },
]

const route = useRoute()
const teamId = computed(() => route.params.team as string)

const { data: bookings, status, refresh } = useFetch<Booking[]>(
  () => `/api/teams/${teamId.value}/customer-bookings`,
  {
    key: 'customer-bookings',
  },
)

// Fetch team's bookings settings
const { data: settingsData } = useFetch<BookingsSettings[]>(
  () => `/api/teams/${teamId.value}/bookings-settings`,
  {
    key: 'team-bookings-settings',
  },
)

// Use statuses from settings or defaults
const statuses = computed<StatusItem[]>(() => {
  const settings = settingsData.value?.[0]
  if (settings?.statuses && settings.statuses.length > 0) {
    return settings.statuses
  }
  return DEFAULT_STATUSES
})

// Dynamic status filter state
const statusFilters = ref<Record<string, boolean>>({})

// Initialize filters when statuses change
watch(statuses, (newStatuses) => {
  newStatuses.forEach((s) => {
    if (!(s.value in statusFilters.value)) {
      // Default: cancelled off, others on
      statusFilters.value[s.value] = s.value !== 'cancelled'
    }
  })
}, { immediate: true })

// Toggle status filter
function toggleStatus(key: string) {
  statusFilters.value[key] = !statusFilters.value[key]
}

// Get all unique statuses from bookings (for reference)
const availableStatuses = computed<string[]>(() => {
  if (!bookings.value) return []
  const statusSet = new Set<string>()
  bookings.value.forEach((b) => {
    const s = b.status?.toLowerCase()
    if (s) statusSet.add(s)
  })
  return Array.from(statusSet)
})

// Filtered bookings based on status
const filteredBookings = computed(() => {
  if (!bookings.value) return []
  return bookings.value.filter((b) => {
    const s = b.status?.toLowerCase() as StatusKey
    return statusFilters.value[s] !== false
  })
})

// Calendar - selected date and year
const currentYear = ref(new Date().getFullYear())
const selectedDate = ref<Date | null>(null)

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
function getBookingStatusForDate(date: DateValue): string | null {
  if (!bookings.value) return null
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  const booking = bookings.value.find((b) => {
    const bookingDate = new Date(b.date)
    const bookingStr = bookingDate.toISOString().substring(0, 10)
    return bookingStr === dateStr
  })
  return booking?.status?.toLowerCase() || null
}

// Get chip color based on status - dynamic lookup
function getChipColorForDate(date: DateValue): 'success' | 'warning' | 'error' | 'info' | 'neutral' | undefined {
  const status = getBookingStatusForDate(date)
  if (!status) return undefined
  return getStatusColor(status)
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

// When calendar date is selected, could scroll to / highlight those bookings
watch(selectedDate, (newDate) => {
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

// Status badge color - dynamic lookup from settings
function getStatusColor(statusValue: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const statusItem = statuses.value.find(s => s.value === statusValue?.toLowerCase())
  return statusItem?.color || 'neutral'
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="status === 'pending'" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-muted animate-spin mx-auto mb-3" />
      <p class="text-muted">
        Loading your bookings...
      </p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasBookings" class="text-center py-12">
      <UIcon name="i-lucide-calendar-x" class="w-16 h-16 text-muted mx-auto mb-4" />
      <h3 class="text-lg font-medium mb-2">
        No bookings yet
      </h3>
      <p class="text-muted mb-6">
        You haven't made any bookings yet. Create your first one!
      </p>
      <UButton :to="`/dashboard/${teamId}/bookings/new`">
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-2" />
        Book Now
      </UButton>
    </div>

    <!-- Bookings list -->
    <div v-else class="space-y-6">
      <!-- Year Calendar -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 text-muted" />
              <span class="text-sm font-medium">{{ currentYear }}</span>
            </div>
            <!-- Legend -->
            <div class="flex items-center gap-3 text-xs text-muted">
              <div v-for="statusItem in statuses" :key="statusItem.id" class="flex items-center gap-1">
                <UChip :color="statusItem.color" size="xs" standalone inset />
                <span>{{ statusItem.label }}</span>
              </div>
            </div>
          </div>
        </template>
        <CroutonCalendarYear
          v-model="selectedDate"
          :year="currentYear"
          size="xs"
          color="primary"
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
        </CroutonCalendarYear>
      </UCard>

      <!-- Status Filters + List -->
      <div class="space-y-4">
        <!-- Header with count and refresh -->
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted">
            {{ filteredBookings.length }} of {{ bookings?.length }} booking{{ bookings?.length === 1 ? '' : 's' }}
          </p>
          <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-refresh-cw" @click="() => refresh()" />
        </div>

        <!-- Status Filter Toggles -->
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="statusItem in statuses"
            :key="statusItem.id"
            size="xs"
            :variant="statusFilters[statusItem.value] ? 'solid' : 'outline'"
            :color="statusItem.color"
            @click="toggleStatus(statusItem.value)"
          >
            <UIcon
              :name="statusFilters[statusItem.value] ? 'i-lucide-check' : 'i-lucide-x'"
              class="w-3 h-3 mr-1"
            />
            {{ statusItem.label }}
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
                    <h3 class="font-semibold">
                      {{ booking.locationData?.title || 'Unknown Location' }}
                    </h3>
                    <p class="text-sm text-muted mt-1">
                      {{ formatDate(booking.date) }} at {{ getSlotLabel(booking) }}
                    </p>
                  </div>
                  <UBadge :color="getStatusColor(booking.status)" variant="subtle">
                    {{ booking.status }}
                  </UBadge>
                </div>

                <div v-if="booking.locationData?.city" class="mt-2">
                  <p class="text-xs text-muted">
                    <UIcon name="i-lucide-map-pin" class="w-3 h-3 inline mr-1" />
                    {{ [booking.locationData.street, booking.locationData.city].filter(Boolean).join(', ') }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Empty state when filtered -->
          <div v-if="filteredBookings.length === 0" class="text-center py-8">
            <UIcon name="i-lucide-filter-x" class="w-12 h-12 text-muted mx-auto mb-3" />
            <p class="text-sm text-muted">No bookings match the selected filters</p>
            <UButton
              variant="link"
              size="sm"
              class="mt-2"
              @click="statuses.forEach(s => statusFilters[s.value] = true)"
            >
              Show all bookings
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
