<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

const { t } = useT()

interface SlotItem {
  id: string
  label?: string
  value?: string
  color?: string
}

interface Booking {
  id: string
  location: string
  date: string | Date
  slot: string[] | string | null
  group?: string | null
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
  value: string
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

// Status keys type
type StatusKey = 'confirmed' | 'pending' | 'cancelled'

// Hardcoded statuses - labels come from translations
const STATUSES: StatusItem[] = [
  { id: '1', value: 'confirmed', color: 'success' },
  { id: '2', value: 'pending', color: 'warning' },
  { id: '3', value: 'cancelled', color: 'error' },
]

const route = useRoute()
const teamId = computed(() => route.params.team as string)

const { data: bookings, status, refresh } = useFetch<Booking[]>(
  () => `/api/teams/${teamId.value}/customer-bookings`,
  {
    key: 'customer-bookings',
  },
)

// Fetch settings for group labels
interface GroupItem { id: string, label: string }
interface SettingsData { enableGroups?: boolean, groups?: GroupItem[] }
const { data: settingsData } = useFetch<SettingsData[]>(
  () => `/api/teams/${teamId.value}/bookings-settings`,
  { key: 'mybookings-settings' },
)
const groupOptions = computed(() => settingsData.value?.[0]?.groups ?? [])

// Use hardcoded statuses - labels come from translations
const statuses = STATUSES

// User overrides - starts empty (hydration-safe)
const statusOverrides = ref<Record<string, boolean>>({})

// Computed: defaults merged with user overrides
const statusFilters = computed(() =>
  Object.fromEntries(
    statuses.map(s => [
      s.value,
      statusOverrides.value[s.value] ?? s.value !== 'cancelled',
    ]),
  ),
)

// Toggle stores in overrides
function toggleStatus(key: string) {
  statusOverrides.value[key] = !statusFilters.value[key]
}

// Get unique locations from bookings
interface LocationItem {
  id: string
  title: string
}
const availableLocations = computed<LocationItem[]>(() => {
  if (!bookings.value) return []
  const locationMap = new Map<string, string>()
  bookings.value.forEach((b) => {
    if (b.location && b.locationData?.title) {
      locationMap.set(b.location, b.locationData.title)
    }
  })
  return Array.from(locationMap.entries()).map(([id, title]) => ({ id, title }))
})

// Location color palette for calendar dots (hex colors for inline styles)
const LOCATION_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#a855f7', // purple
  '#f43f5e', // rose
  '#06b6d4', // cyan
]

// Map location IDs to colors (stable assignment based on order)
const locationColorMap = computed(() => {
  const map = new Map<string, string>()
  availableLocations.value.forEach((loc, index) => {
    const colorIndex = index % LOCATION_COLORS.length
    map.set(loc.id, LOCATION_COLORS[colorIndex]!)
  })
  return map
})

function getLocationColor(locationId: string): string {
  return locationColorMap.value.get(locationId) ?? LOCATION_COLORS[0]!
}

// Location filter state - all locations enabled by default
const locationOverrides = ref<Record<string, boolean>>({})

const locationFilters = computed(() =>
  Object.fromEntries(
    availableLocations.value.map(loc => [
      loc.id,
      locationOverrides.value[loc.id] ?? true,
    ]),
  ),
)

function toggleLocation(locationId: string) {
  locationOverrides.value[locationId] = !locationFilters.value[locationId]
}

// Filtered bookings based on status AND location
const filteredBookings = computed(() => {
  if (!bookings.value) return []
  return bookings.value.filter((b) => {
    const s = b.status?.toLowerCase() as StatusKey
    const statusMatch = statusFilters.value[s] !== false
    const locationMatch = locationFilters.value[b.location] !== false
    return statusMatch && locationMatch
  })
})

// Calendar - selected date
const selectedDate = ref<Date | null>(null)

// Helper to get local date string (YYYY-MM-DD) from a Date
function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Get dates that have bookings for calendar highlighting (respects status filters)
function hasBookingOnDate(date: DateValue): boolean {
  if (!filteredBookings.value.length) return false
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return filteredBookings.value.some((b) => {
    const bookingDate = new Date(b.date)
    const bookingStr = toLocalDateStr(bookingDate)
    return bookingStr === dateStr
  })
}

// Get booking status for a date (for coloring the chip, respects status filters)
function getBookingStatusForDate(date: DateValue): string | null {
  if (!filteredBookings.value.length) return null
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  const booking = filteredBookings.value.find((b) => {
    const bookingDate = new Date(b.date)
    const bookingStr = toLocalDateStr(bookingDate)
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

// Get bookings for a specific date (respects status filters)
function getBookingsForDate(date: DateValue): Booking[] {
  if (!filteredBookings.value.length) return []
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return filteredBookings.value.filter((b) => {
    const bookingDate = new Date(b.date)
    const bookingStr = toLocalDateStr(bookingDate)
    return bookingStr === dateStr
  })
}

// Get unique locations with bookings for a specific date
interface LocationBooking {
  locationId: string
  locationTitle: string
  color: string
  bookings: Booking[]
  slots: SlotItem[]
  bookedSlotIds: string[]
}

function getLocationBookingsForDate(date: DateValue): LocationBooking[] {
  const dateBookings = getBookingsForDate(date)
  if (dateBookings.length === 0) return []

  // Group bookings by location
  const locationMap = new Map<string, Booking[]>()
  dateBookings.forEach((b) => {
    const existing = locationMap.get(b.location) || []
    existing.push(b)
    locationMap.set(b.location, existing)
  })

  // Convert to array with color info and slot data
  return Array.from(locationMap.entries()).map(([locationId, bookings]) => {
    // Get slots from the first booking's location data (all bookings at same location have same slots)
    const locationSlots = bookings[0] ? parseLocationSlots(bookings[0]) : []
    // Collect all booked slot IDs from all bookings at this location
    const bookedIds: string[] = []
    bookings.forEach((b) => {
      const ids = parseBookingSlotIds(b)
      bookedIds.push(...ids)
    })

    return {
      locationId,
      locationTitle: bookings[0]?.locationData?.title || 'Unknown',
      color: getLocationColor(locationId),
      bookings,
      slots: locationSlots.filter(s => s.id !== 'all-day').map(s => ({
        id: s.id,
        label: s.label || s.value || s.id,
        color: s.color || '#94a3b8',
      })),
      bookedSlotIds: bookedIds,
    }
  })
}

// Tooltip text for dates with bookings - now shows location and status details
function getTooltipForDate(date: DateValue): string {
  const locationBookings = getLocationBookingsForDate(date)
  if (locationBookings.length === 0) return ''

  return locationBookings.map((lb) => {
    const slots = lb.bookings.map(b => getSlotLabel(b)).join(', ')
    const status = lb.bookings[0]?.status || ''
    return `${lb.locationTitle}: ${slots} (${status})`
  }).join('\n')
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

// Parse location slots helper
function parseLocationSlots(booking: Booking): SlotItem[] {
  if (!booking.locationData?.slots) return []
  try {
    const slots = typeof booking.locationData.slots === 'string'
      ? JSON.parse(booking.locationData.slots)
      : booking.locationData.slots
    return Array.isArray(slots) ? slots : []
  }
  catch {
    return []
  }
}

// Parse booking slot IDs helper
function parseBookingSlotIds(booking: Booking): string[] {
  if (!booking.slot) return []
  try {
    const slotIds = typeof booking.slot === 'string'
      ? JSON.parse(booking.slot)
      : booking.slot
    return Array.isArray(slotIds) ? slotIds : []
  }
  catch {
    return []
  }
}

// Get slot label from booking
function getSlotLabel(booking: Booking): string {
  const locationSlots = parseLocationSlots(booking)
  const bookingSlotIds = parseBookingSlotIds(booking)

  if (locationSlots.length === 0 || bookingSlotIds.length === 0) return '-'

  // Find matching slot
  const slot = locationSlots.find(s => bookingSlotIds.includes(s.id))
  return slot?.label || slot?.value || '-'
}

// Get slot position info for indicator
function getSlotPositionInfo(booking: Booking): { totalSlots: number, position: number, color?: string } | null {
  const locationSlots = parseLocationSlots(booking)
  const bookingSlotIds = parseBookingSlotIds(booking)

  if (locationSlots.length === 0 || bookingSlotIds.length === 0) return null

  // Find the position of the booked slot
  const position = locationSlots.findIndex(s => bookingSlotIds.includes(s.id))
  if (position === -1) return null

  return {
    totalSlots: locationSlots.length,
    position,
    color: locationSlots[position]?.color
  }
}

// Status badge color - lookup from hardcoded statuses
function getStatusColor(statusValue: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const statusItem = statuses.find(s => s.value === statusValue?.toLowerCase())
  return statusItem?.color || 'neutral'
}

// Status badge label - uses translations
function getStatusLabel(statusValue: string): string {
  const key = `bookings.status.${statusValue?.toLowerCase()}`
  const translated = t(key)
  // If translation exists, use it; otherwise fallback to the raw value
  return translated !== key ? translated : statusValue
}

// Get group label from settings
function getGroupLabel(groupId: string | null | undefined): string | null {
  if (!groupId) return null
  const group = groupOptions.value.find(g => g.id === groupId)
  return group?.label || groupId
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="status === 'pending'" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-muted animate-spin mx-auto mb-3" />
      <p class="text-muted">

        {{ t('bookings.list.loading') }}
      </p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasBookings" class="text-center py-12">
      <UIcon name="i-lucide-calendar-x" class="w-16 h-16 text-muted mx-auto mb-4" />
      <h3 class="text-lg font-medium mb-2">
        {{ t('bookings.list.noBookings') }}
      </h3>
      <p class="text-muted mb-6">
        {{ t('bookings.list.noBookingsDescription') }}
      </p>
      <UButton :to="`/dashboard/${teamId}/bookings/new`">
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-2" />
        {{ t('bookings.list.bookNow') }}
      </UButton>
    </div>

    <!-- Bookings list -->
    <div v-else class="space-y-6">
      <!-- Header with count and refresh -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted">
          {{ filteredBookings.length }} of {{ bookings?.length }} booking{{ bookings?.length === 1 ? '' : 's' }}
        </p>
        <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-refresh-cw" @click="() => refresh()" />
      </div>

      <!-- Filters -->
      <div class="flex flex-col gap-3">
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
            {{ t('bookings.status.' + statusItem.value) }}
          </UButton>
        </div>

        <!-- Location Filter Toggles -->
        <div v-if="availableLocations.length > 1" class="flex flex-wrap gap-2">
          <UButton
            v-for="loc in availableLocations"
            :key="loc.id"
            size="xs"
            :variant="locationFilters[loc.id] ? 'solid' : 'outline'"
            color="neutral"
            @click="toggleLocation(loc.id)"
          >
            <span
              style="width: 8px; height: 8px; border-radius: 50%; margin-right: 6px;"
              :style="{ backgroundColor: getLocationColor(loc.id) }"
            />
            <UIcon
              :name="locationFilters[loc.id] ? 'i-lucide-check' : 'i-lucide-x'"
              class="w-3 h-3 mr-1"
            />
            {{ loc.title }}
          </UButton>
        </div>
      </div>

      <!-- Calendar -->
      <UCard>
        <template v-if="availableLocations.length > 1" #header>
          <!-- Location Legend -->
          <div class="flex items-center gap-3 text-xs text-muted">
            <div v-for="loc in availableLocations" :key="loc.id" class="flex items-center gap-1">
              <span
                style="width: 8px; height: 8px; border-radius: 50%;"
                :style="{ backgroundColor: getLocationColor(loc.id) }"
              />
              <span>{{ loc.title }}</span>
            </div>
          </div>
        </template>
        <CroutonCalendar
          v-model:date="selectedDate"
          :number-of-months="3"
          size="xs"
          color="primary"
        >
          <template #day="{ day }">
            <div class="flex flex-col items-center">
              <span>{{ day.day }}</span>
              <div v-if="hasBookingOnDate(day)" class="flex flex-col gap-0.5 mt-0.5">
                <BookingsLocationsSlotIndicator
                  v-for="lb in getLocationBookingsForDate(day)"
                  :key="lb.locationId"
                  :slots="lb.slots"
                  :booked-slot-ids="lb.bookedSlotIds"
                  size="xs"
                />
              </div>
            </div>
          </template>
        </CroutonCalendar>
      </UCard>

      <!-- Bookings List -->
      <div class="space-y-2">
        <BookingSidebarBookingItem
          v-for="booking in filteredBookings"
          :key="booking.id"
          :id="booking.id"
          :location-title="booking.locationData?.title || 'Unknown Location'"
          :slot-label="getSlotLabel(booking)"
          :slot-color="getSlotPositionInfo(booking)?.color"
          :date="booking.date"
          :group-label="getGroupLabel(booking.group)"
          :status="booking.status"
          show-status
          :total-slots="getSlotPositionInfo(booking)?.totalSlots || 0"
          :slot-position="getSlotPositionInfo(booking)?.position ?? -1"
        />

          <!-- Empty state when filtered -->
          <div v-if="filteredBookings.length === 0" class="text-center py-8">
            <UIcon name="i-lucide-filter-x" class="w-12 h-12 text-muted mx-auto mb-3" />
            <p class="text-sm text-muted">{{ t('bookings.list.noFilterMatch') }}</p>
            <UButton
              variant="link"
              size="sm"
              class="mt-2"
              @click="statusOverrides = {}; locationOverrides = {}"
            >
              {{ t('bookings.list.showAllBookings') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
</template>
