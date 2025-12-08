<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { fromDate, toCalendarDate, getLocalTimeZone } from '@internationalized/date'
import type { SlotOption } from '../composables/useBookingAvailability'

interface Props {
  locationId: string | null
  locationSlots: SlotOption[] | null | undefined
  modelValue?: Date | null
}

const props = withDefaults(defineProps<Props>(), {
  locationId: null,
  locationSlots: () => [],
  modelValue: null
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
  'availableSlotsChanged': [slots: SlotOption[]]
}>()

// Refs for the composable
const locationIdRef = computed(() => props.locationId)
const locationSlotsRef = computed(() => props.locationSlots)

const {
  loading,
  fetchAvailability,
  hasBookingsOnDate,
  isDateFullyBooked,
  getBookedSlotLabelsForDate,
  getAvailableSlotsForDate
} = useBookingAvailability(locationIdRef, locationSlotsRef)

// Internal calendar value (DateValue format)
const internalValue = computed({
  get: () => {
    if (!props.modelValue) return undefined
    const zonedDateTime = fromDate(props.modelValue, getLocalTimeZone())
    return toCalendarDate(zonedDateTime)
  },
  set: (value: DateValue | undefined) => {
    if (!value) {
      emit('update:modelValue', null)
      emit('availableSlotsChanged', [])
      return
    }
    const date = value.toDate(getLocalTimeZone())
    emit('update:modelValue', date)
    emit('availableSlotsChanged', getAvailableSlotsForDate(date))
  }
})

// Track current visible month for fetching availability
const currentPlaceholder = ref<DateValue | undefined>()

// Fetch availability when location changes or month changes
watch([locationIdRef, currentPlaceholder], async () => {
  if (!props.locationId) return

  // Calculate date range for current visible month(s)
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0) // 3 months ahead

  await fetchAvailability(startDate, endDate)
}, { immediate: true })

// Check if a date should be disabled (fully booked)
function isDateDisabled(date: DateValue): boolean {
  return isDateFullyBooked(date)
}

// Get chip color based on booking status
function getChipColor(date: DateValue): 'warning' | 'error' | undefined {
  if (!hasBookingsOnDate(date)) return undefined
  if (isDateFullyBooked(date)) return 'error'
  return 'warning'
}

// Format booked slots for tooltip
function getTooltipText(date: DateValue): string {
  const bookedSlots = getBookedSlotLabelsForDate(date)
  if (bookedSlots.length === 0) return ''

  const slotNames = bookedSlots.map(s => s.label).join(', ')
  return `Booked: ${slotNames}`
}
</script>

<template>
  <div class="calendar-with-availability">
    <div v-if="!locationId" class="text-sm text-muted p-4 text-center">
      Select a location to view availability
    </div>

    <div v-else-if="loading" class="flex items-center justify-center p-4">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
      <span class="text-sm text-muted">Loading availability...</span>
    </div>

    <UCalendar
      v-else
      v-model="internalValue"
      :is-date-disabled="isDateDisabled"
      @update:placeholder="currentPlaceholder = $event"
    >
      <template #day="{ day }">
        <UTooltip
          v-if="hasBookingsOnDate(day)"
          :text="getTooltipText(day)"
          :delay-duration="200"
        >
          <UChip
            :color="getChipColor(day)"
            size="2xs"
            :show="hasBookingsOnDate(day)"
          >
            {{ day.day }}
          </UChip>
        </UTooltip>
        <span v-else>{{ day.day }}</span>
      </template>
    </UCalendar>

    <!-- Legend -->
    <div class="flex items-center gap-4 mt-3 text-xs text-muted justify-center">
      <div class="flex items-center gap-1">
        <UChip color="warning" size="xs" standalone inset />
        <span>Partially booked</span>
      </div>
      <div class="flex items-center gap-1">
        <UChip color="error" size="xs" standalone inset />
        <span>Fully booked</span>
      </div>
    </div>
  </div>
</template>
