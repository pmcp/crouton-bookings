<script setup lang="ts">
import type { SelectItem, RadioGroupItem } from '@nuxt/ui'
import type { DateValue } from '@internationalized/date'
import { fromDate, toCalendarDate, getLocalTimeZone } from '@internationalized/date'

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
  getBookedSlotLabelsForDate,
} = useBookingCart()

// Transform locations to select items
const locationOptions = computed<SelectItem[]>(() => {
  if (!locations.value) return []

  return locations.value.map(loc => ({
    label: loc.title,
    value: loc.id,
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

// Get chip color based on booking status
function getChipColor(dateValue: DateValue): 'warning' | 'error' | undefined {
  const date = dateValueToDate(dateValue)
  if (!hasBookingsOnDate(date)) return undefined
  if (isDateFullyBooked(date)) return 'error'
  return 'warning'
}

// Get tooltip text for booked dates
function getTooltipText(dateValue: DateValue): string {
  const labels = getBookedSlotLabelsForDate(dateValueToDate(dateValue))
  if (labels.length === 0) return ''
  return `Booked: ${labels.join(', ')}`
}

// Check if date has bookings (for template)
function dateHasBookings(dateValue: DateValue): boolean {
  return hasBookingsOnDate(dateValueToDate(dateValue))
}
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Location Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Location
      </label>
      <USelect
        v-model="formState.locationId"
        :items="locationOptions"
        :loading="locationsStatus === 'pending'"
        placeholder="Select a location"
        icon="i-lucide-map-pin"
        class="w-full"
        value-key="value"
      />
    </div>

    <!-- Calendar with availability indicators -->
    <div v-if="formState.locationId">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Date
      </label>

      <!-- Loading state -->
      <div v-if="availabilityLoading" class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-5 h-5 text-gray-400 animate-spin mr-2" />
        <span class="text-sm text-gray-500">Loading availability...</span>
      </div>

      <!-- Calendar -->
      <div v-else class="flex flex-col items-center">
        <UCalendar
          v-model="calendarValue"
          :is-date-disabled="isDateDisabled"
        >
          <template #day="{ day }">
            <UTooltip
              v-if="dateHasBookings(day)"
              :text="getTooltipText(day)"
              :delay-duration="200"
            >
              <UChip
                :color="getChipColor(day)"
                size="2xs"
                :show="dateHasBookings(day)"
              >
                {{ day.day }}
              </UChip>
            </UTooltip>
            <span v-else>{{ day.day }}</span>
          </template>
        </UCalendar>

        <!-- Legend -->
        <div class="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-1">
            <UChip color="warning" size="xs" standalone inset />
            <span>Partial</span>
          </div>
          <div class="flex items-center gap-1">
            <UChip color="error" size="xs" standalone inset />
            <span>Full</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Slots - only show when date selected -->
    <div v-if="formState.date && formState.locationId && !availabilityLoading">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Time Slot
      </label>

      <!-- No slots configured -->
      <div v-if="slotItems.length === 0" class="text-center py-4">
        <UIcon name="i-lucide-clock" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">
          No time slots configured
        </p>
      </div>

      <!-- Slots RadioGroup -->
      <URadioGroup
        v-else
        v-model="formState.slotId"
        :items="slotItems"
        variant="card"
        indicator="hidden"
        orientation="horizontal"
        :ui="{
          fieldset: 'grid grid-cols-2 gap-2',
          item: 'w-full justify-center',
          wrapper: 'text-center',
        }"
      />
    </div>

    <!-- Selected Summary -->
    <div v-if="selectedLocation && formState.date && formState.slotId" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Selected
      </p>
      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
        {{ selectedLocation.title }}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ formState.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}
        at {{ availableSlots.find(s => s.id === formState.slotId)?.label || formState.slotId }}
      </p>
    </div>

    <!-- Add to Cart Button -->
    <UButton
      block
      :disabled="!canAddToCart"
      icon="i-lucide-plus"
      @click="addToCart"
    >
      Add to Cart
    </UButton>
  </div>
</template>
