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

type StatusKey = 'confirmed' | 'pending' | 'cancelled'

const STATUSES: StatusItem[] = [
  { id: '1', value: 'confirmed', color: 'success' },
  { id: '2', value: 'pending', color: 'warning' },
  { id: '3', value: 'cancelled', color: 'error' },
]

const { columns } = useBookingsBookings()
const { items: rawBookings, pending } = await useCollectionQuery('bookingsBookings')

// Cast bookings to proper type
const bookings = computed(() => (rawBookings.value || []) as Booking[])

// Fetch settings for group labels
const { items: settingsItems } = await useCollectionQuery('bookingsSettings')
const groupOptions = computed(() => settingsItems.value?.[0]?.groups ?? [])

const statuses = STATUSES

// Status filter state
const statusOverrides = ref<Record<string, boolean>>({})
const statusFilters = computed(() =>
  Object.fromEntries(
    statuses.map(s => [
      s.value,
      statusOverrides.value[s.value] ?? s.value !== 'cancelled',
    ]),
  ),
)

function toggleStatus(key: string) {
  statusOverrides.value[key] = !statusFilters.value[key]
}

// Location filter state
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

const LOCATION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#f43f5e', '#06b6d4']

const locationColorMap = computed(() => {
  const map = new Map<string, string>()
  availableLocations.value.forEach((loc, index) => {
    map.set(loc.id, LOCATION_COLORS[index % LOCATION_COLORS.length]!)
  })
  return map
})

function getLocationColor(locationId: string): string {
  return locationColorMap.value.get(locationId) ?? LOCATION_COLORS[0]!
}

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

// Date range filter (using CroutonCalendar's v-model:startDate/endDate pattern)
const rangeStartDate = ref<Date | null>(null)
const rangeEndDate = ref<Date | null>(null)

const hasActiveRange = computed(() => rangeStartDate.value !== null)

function clearDateFilter() {
  rangeStartDate.value = null
  rangeEndDate.value = null
}

// Helper functions
function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dateValueToDateStr(date: DateValue): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

// Filtered bookings (status + location + date range)
const filteredBookings = computed(() => {
  if (!bookings.value) return []

  return bookings.value.filter((b) => {
    const s = b.status?.toLowerCase() as StatusKey
    const statusMatch = statusFilters.value[s] !== false
    const locationMatch = locationFilters.value[b.location] !== false

    // Date range filter
    let dateMatch = true
    if (hasActiveRange.value && rangeStartDate.value) {
      const bookingDate = new Date(b.date)
      bookingDate.setHours(0, 0, 0, 0)

      const rangeStart = new Date(rangeStartDate.value)
      rangeStart.setHours(0, 0, 0, 0)

      const rangeEnd = new Date(rangeEndDate.value || rangeStartDate.value)
      rangeEnd.setHours(23, 59, 59, 999)

      dateMatch = bookingDate >= rangeStart && bookingDate <= rangeEnd
    }

    return statusMatch && locationMatch && dateMatch
  })
})

// Calendar helpers
function hasBookingOnDate(date: DateValue): boolean {
  if (!bookings.value?.length) return false
  const dateStr = dateValueToDateStr(date)
  return bookings.value.some((b) => {
    const s = b.status?.toLowerCase() as StatusKey
    if (statusFilters.value[s] === false) return false
    if (locationFilters.value[b.location] === false) return false
    const bookingDate = new Date(b.date)
    return toLocalDateStr(bookingDate) === dateStr
  })
}

function getBookingsForDate(date: DateValue): Booking[] {
  if (!bookings.value?.length) return []
  const dateStr = dateValueToDateStr(date)
  return bookings.value.filter((b) => {
    const s = b.status?.toLowerCase() as StatusKey
    if (statusFilters.value[s] === false) return false
    if (locationFilters.value[b.location] === false) return false
    const bookingDate = new Date(b.date)
    return toLocalDateStr(bookingDate) === dateStr
  })
}

interface LocationBooking {
  locationId: string
  locationTitle: string
  color: string
  bookings: Booking[]
  slots: SlotItem[]
  bookedSlotIds: string[]
}

function parseLocationSlots(booking: Booking): SlotItem[] {
  if (!booking.locationData?.slots) return []
  try {
    const slots = typeof booking.locationData.slots === 'string'
      ? JSON.parse(booking.locationData.slots)
      : booking.locationData.slots
    return Array.isArray(slots) ? slots : []
  } catch {
    return []
  }
}

function parseBookingSlotIds(booking: Booking): string[] {
  if (!booking.slot) return []
  try {
    const slotIds = typeof booking.slot === 'string'
      ? JSON.parse(booking.slot)
      : booking.slot
    return Array.isArray(slotIds) ? slotIds : []
  } catch {
    return []
  }
}

function getLocationBookingsForDate(date: DateValue): LocationBooking[] {
  const dateBookings = getBookingsForDate(date)
  if (dateBookings.length === 0) return []

  const locationMap = new Map<string, Booking[]>()
  dateBookings.forEach((b) => {
    const existing = locationMap.get(b.location) || []
    existing.push(b)
    locationMap.set(b.location, existing)
  })

  return Array.from(locationMap.entries()).map(([locationId, locBookings]) => {
    const locationSlots = locBookings[0] ? parseLocationSlots(locBookings[0]) : []
    const bookedIds: string[] = []
    locBookings.forEach((b) => {
      bookedIds.push(...parseBookingSlotIds(b))
    })

    return {
      locationId,
      locationTitle: locBookings[0]?.locationData?.title || 'Unknown',
      color: getLocationColor(locationId),
      bookings: locBookings,
      slots: locationSlots.filter(s => s.id !== 'all-day').map(s => ({
        id: s.id,
        label: s.label || s.value || s.id,
        color: s.color || '#94a3b8',
      })),
      bookedSlotIds: bookedIds,
    }
  })
}

// Slot helpers for booking cards
function getSlotLabel(booking: Booking): string {
  const locationSlots = parseLocationSlots(booking)
  const bookingSlotIds = parseBookingSlotIds(booking)
  if (locationSlots.length === 0 || bookingSlotIds.length === 0) return '-'
  const slot = locationSlots.find(s => bookingSlotIds.includes(s.id))
  return slot?.label || slot?.value || '-'
}

function getSlotPositionInfo(booking: Booking): { totalSlots: number, position: number, color?: string } | null {
  const locationSlots = parseLocationSlots(booking)
  const bookingSlotIds = parseBookingSlotIds(booking)
  if (locationSlots.length === 0 || bookingSlotIds.length === 0) return null
  const position = locationSlots.findIndex(s => bookingSlotIds.includes(s.id))
  if (position === -1) return null
  return { totalSlots: locationSlots.length, position, color: locationSlots[position]?.color }
}

function getStatusColor(statusValue: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const statusItem = statuses.find(s => s.value === statusValue?.toLowerCase())
  return statusItem?.color || 'neutral'
}

function getGroupLabel(groupId: string | null | undefined): string | null {
  if (!groupId) return null
  const group = groupOptions.value.find((g: any) => g.id === groupId)
  return group?.label || groupId
}

// Format filter range display
const filterRangeDisplay = computed(() => {
  if (!rangeStartDate.value) return ''
  const formatDate = (d: Date) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d)
  const start = formatDate(rangeStartDate.value)
  if (!rangeEndDate.value || rangeStartDate.value.getTime() === rangeEndDate.value.getTime()) {
    return start
  }
  return `${start} – ${formatDate(rangeEndDate.value)}`
})

const hasBookings = computed(() => bookings.value && bookings.value.length > 0)
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-muted animate-spin mx-auto mb-3" />
      <p class="text-muted">Loading bookings...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasBookings" class="text-center py-12">
      <UIcon name="i-lucide-calendar-x" class="w-16 h-16 text-muted mx-auto mb-4" />
      <h3 class="text-lg font-medium mb-2">No bookings yet</h3>
      <p class="text-muted mb-6">Create your first booking to get started.</p>
      <CroutonTableHeader
        title=""
        collection="bookingsBookings"
        createButton
      />
    </div>

    <!-- Bookings with calendar -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted">
          {{ filteredBookings.length }} of {{ bookings?.length }} booking{{ bookings?.length === 1 ? '' : 's' }}
        </p>
        <CroutonTableHeader
          title=""
          collection="bookingsBookings"
          createButton
        />
      </div>

      <!-- Filters -->
      <div class="flex flex-col gap-3">
        <!-- Status filters -->
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

        <!-- Location filters -->
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
              class="w-2 h-2 rounded-full mr-1.5"
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

      <!-- Calendar with range selection -->
      <UCard>
        <template v-if="availableLocations.length > 1" #header>
          <div class="flex items-center gap-3 text-xs text-muted">
            <div v-for="loc in availableLocations" :key="loc.id" class="flex items-center gap-1">
              <span
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: getLocationColor(loc.id) }"
              />
              <span>{{ loc.title }}</span>
            </div>
          </div>
        </template>

        <CroutonCalendar
          v-model:start-date="rangeStartDate"
          v-model:end-date="rangeEndDate"
          range
          :number-of-months="3"
          size="sm"
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

      <!-- Filter indicator -->
      <div
        v-if="hasActiveRange"
        class="px-3 py-2 bg-primary/10 rounded-lg flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-2 text-sm text-primary">
          <UIcon name="i-lucide-filter" class="w-4 h-4" />
          <span>{{ filterRangeDisplay }}</span>
        </div>
        <UButton
          size="xs"
          variant="ghost"
          color="primary"
          icon="i-lucide-x"
          @click="clearDateFilter"
        />
      </div>

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

        <!-- Empty filtered state -->
        <div v-if="filteredBookings.length === 0" class="text-center py-8">
          <UIcon name="i-lucide-filter-x" class="w-12 h-12 text-muted mx-auto mb-3" />
          <p class="text-sm text-muted">No bookings match the current filters</p>
          <UButton
            variant="link"
            size="sm"
            class="mt-2"
            @click="statusOverrides = {}; locationOverrides = {}; clearDateFilter()"
          >
            Clear all filters
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
