<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'
import type { DateValue } from '@internationalized/date'
import { fromDate, toCalendarDate, getLocalTimeZone } from '@internationalized/date'

const { t } = useT()

interface Props {
  hideLocationSelect?: boolean
}

withDefaults(defineProps<Props>(), {
  hideLocationSelect: false,
})

const {
  formState,
  locations,
  locationsStatus,
  selectedLocation,
  allSlots,
  availableSlots,
  isSlotDisabled,
  availabilityLoading,
  canAddToCart,
  addToCart,
  hasBookingsOnDate,
  isDateFullyBooked,
  getBookedSlotsForDate,
} = useBookingCart()

// Fallback colors for slots without a color set (assigned by index)
const FALLBACK_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#14b8a6', '#a855f7', '#ef4444']
const DEFAULT_SLOT_COLOR = '#9ca3af'

// Get fallback color by slot index
function getFallbackColor(slotId: string): string {
  // Find index in allSlots (skip 'all-day' at index 0)
  const index = allSlots.value.findIndex(s => s.id === slotId)
  if (index <= 0) return DEFAULT_SLOT_COLOR
  return FALLBACK_COLORS[(index - 1) % FALLBACK_COLORS.length]
}

// Get the color for a slot (from slot data or fallback)
function getSlotColorById(slotId: string): string {
  const slot = allSlots.value.find(s => s.id === slotId)
  // Use slot color if set, otherwise use fallback based on index
  return slot?.color || getFallbackColor(slotId)
}

// Get booked slots with their colors for a date
function getBookedSlotsWithColors(date: Date): Array<{ id: string, label: string, color: string }> {
  const bookedIds = getBookedSlotsForDate(date)
  // Filter out 'all-day' - if all-day is booked, date is fully booked anyway
  return bookedIds
    .filter(id => id !== 'all-day')
    .map((id) => {
      const slot = allSlots.value.find(s => s.id === id)
      return {
        id,
        label: slot?.label || id,
        color: slot?.color || getFallbackColor(id),
      }
    })
}

// Extended location option interface for enhanced dropdown
interface LocationOption {
  label: string
  value: string
  address: string
}

// Transform locations to select items with address
const locationOptions = computed<LocationOption[]>(() => {
  if (!locations.value) return []

  return locations.value.map(loc => ({
    label: loc.title,
    value: loc.id,
    address: [loc.street, loc.city, loc.zip].filter(Boolean).join(', '),
  }))
})

// Transform slots to RadioGroup items with disabled state
const slotItems = computed<RadioGroupItem[]>(() => {
  return allSlots.value.map(slot => ({
    label: slot.label || slot.value || slot.id,
    value: slot.id,
    disabled: isSlotDisabled(slot.id),
  }))
})

// Internal calendar value (DateValue format for UCalendar)
const calendarValue = computed({
  get: () => {
    if (!formState.date) return undefined
    const zonedDateTime = fromDate(formState.date, getLocalTimeZone())
    return toCalendarDate(zonedDateTime)
  },
  set: (value: DateValue | undefined) => {
    if (!value) {
      formState.date = null
    }
    else {
      formState.date = value.toDate(getLocalTimeZone())
    }
    // Reset slot when date changes
    formState.slotId = null
  },
})

// Convert DateValue to Date for helper functions
function dateValueToDate(dateValue: DateValue): Date {
  return dateValue.toDate(getLocalTimeZone())
}

// Check if date should be disabled (fully booked)
function isDateDisabled(dateValue: DateValue): boolean {
  return isDateFullyBooked(dateValueToDate(dateValue))
}

// Get booked slots for a DateValue (used in template)
function getBookedSlotsForDateValue(dateValue: DateValue) {
  const date = dateValueToDate(dateValue)
  // Don't show indicators if fully booked (date will be disabled)
  if (isDateFullyBooked(date)) return []
  return getBookedSlotsWithColors(date)
}

// Get tooltip text for booked dates
function getTooltipText(dateValue: DateValue): string {
  const slots = getBookedSlotsForDateValue(dateValue)
  if (slots.length === 0) return ''
  return `Booked: ${slots.map(s => s.label).join(', ')}`
}

// Check if date has partial bookings (some slots taken, but not all)
function dateHasPartialBookings(dateValue: DateValue): boolean {
  const date = dateValueToDate(dateValue)
  return hasBookingsOnDate(date) && !isDateFullyBooked(date)
}
</script>

<template>
  <div class="p-4 w-full space-y-4">
    <!-- Location Selection - hidden in XL mode -->
    <div v-if="!hideLocationSelect">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ t('bookings.form.location') }}
      </label>
      <USelect
        v-model="formState.locationId"
        :items="locationOptions"
        :loading="locationsStatus === 'pending'"
        :placeholder="t('bookings.form.selectLocation')"
        icon="i-lucide-map-pin"
        class="w-full"
        value-key="value"
      >
        <template #item-label="{ item }">
          <div class="flex flex-col py-0.5">
            <span class="font-medium">{{ item.label }}</span>
            <span v-if="item.address" class="text-xs text-muted">{{ item.address }}</span>
          </div>
        </template>
      </USelect>
    </div>

    <!-- Calendar with availability indicators -->
    <div v-if="formState.locationId">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ t('bookings.form.date') }}
      </label>

      <!-- Loading state -->
      <div v-if="availabilityLoading" class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-5 h-5 text-gray-400 animate-spin mr-2" />
        <span class="text-sm text-gray-500">{{ t('bookings.form.loadingAvailability') }}</span>
      </div>

      <!-- Calendar -->
      <div v-else class="flex flex-col items-center">
        <UCalendar
          v-model="calendarValue"
          :is-date-disabled="isDateDisabled"
          :ui="{ gridRow: 'grid grid-cols-7 mb-1' }"
        >
          <template #day="{ day }">
            <div class="flex flex-col items-center">
              <span>{{ day.day }}</span>
              <div v-if="getBookedSlotsForDateValue(day).length > 0" class="flex gap-px mt-px">
                <span
                  v-for="slot in getBookedSlotsForDateValue(day)"
                  :key="slot.id"
                  class="w-1 h-1 rounded-full"
                  :style="{ backgroundColor: slot.color }"
                />
              </div>
            </div>
          </template>
        </UCalendar>

      </div>
    </div>

    <!-- Time Slots - only show when date selected -->
    <div v-if="formState.date && formState.locationId && !availabilityLoading">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('bookings.form.timeSlot') }}
      </label>

      <!-- No slots configured -->
      <div v-if="slotItems.length === 0" class="text-center py-4">
        <UIcon name="i-lucide-clock" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">
          {{ t('bookings.form.noTimeSlotsConfigured') }}
        </p>
      </div>

      <!-- Slots RadioGroup with colored indicators -->
      <URadioGroup
        v-else
        v-model="formState.slotId"
        :items="slotItems"
        variant="card"
        indicator="hidden"
        orientation="vertical"
        :ui="{
          fieldset: 'grid grid-cols-1 gap-1.5',
          item: 'w-full justify-center py-1.5',
          wrapper: 'text-center',
        }"
      >
        <template #label="{ item }">
          <span
            class="inline-flex items-center justify-center gap-1.5 w-full"
            :class="item.disabled ? 'opacity-50' : ''"
          >
            <span
              v-if="item.value && item.value !== 'all-day'"
              class="w-2 h-2 rounded-full shrink-0"
              :style="{ backgroundColor: item.disabled ? '#6b7280' : getSlotColorById(String(item.value)) }"
            />
            <span :class="item.disabled ? 'line-through text-muted' : ''">{{ item.label }}</span>
            <UBadge v-if="item.disabled" size="xs" color="neutral" variant="subtle" class="ml-1">
              {{ t('bookings.status.booked') }}
            </UBadge>
          </span>
        </template>
      </URadioGroup>

      <!-- Add to Cart button - always visible but disabled when no slot selected -->
      <UButton
        block
        size="lg"
        :color="canAddToCart ? 'primary' : 'neutral'"
        :variant="canAddToCart ? 'solid' : 'soft'"
        icon="i-lucide-plus"
        class="mt-4"
        :disabled="!canAddToCart"
        @click="addToCart"
      >
        {{ t('bookings.form.addToCart') }}
      </UButton>
    </div>

  </div>
</template>
