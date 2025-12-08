<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

const {
  formState,
  locations,
  locationsStatus,
  selectedLocation,
  availableSlots,
  canAddToCart,
  addToCart,
} = useBookingCart()

// Transform locations to select items
const locationOptions = computed<SelectItem[]>(() => {
  if (!locations.value) return []

  return locations.value.map(loc => ({
    label: loc.title,
    value: loc.id,
  }))
})

// Handle date selection
function handleDateSelect(date: Date | null) {
  formState.date = date
  // Reset slot when date changes
  formState.slotId = null
}

// Handle slot selection
function handleSlotSelect(slotId: string) {
  formState.slotId = slotId
}

// Get slot display label
function getSlotLabel(slot: { id: string, label?: string, value?: string }): string {
  return slot.label || slot.value || slot.id
}

// Check if slot is selected
function isSlotSelected(slotId: string): boolean {
  return formState.slotId === slotId
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

    <!-- Calendar - only show when location selected -->
    <div v-if="formState.locationId">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Date
      </label>
      <div class="flex justify-center">
        <CroutonCalendar
          :date="formState.date"
          @update:date="handleDateSelect"
        />
      </div>
    </div>

    <!-- Time Slots - only show when date selected -->
    <div v-if="formState.date && formState.locationId">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Time Slot
      </label>

      <!-- No slots available -->
      <div v-if="availableSlots.length === 0" class="text-center py-4">
        <UIcon name="i-lucide-clock" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">
          No time slots available
        </p>
      </div>

      <!-- Slots grid -->
      <div v-else class="grid grid-cols-3 gap-2">
        <button
          v-for="slot in availableSlots"
          :key="slot.id"
          type="button"
          class="px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200"
          :class="[
            isSlotSelected(slot.id)
              ? 'border-primary bg-primary/10 text-primary font-medium'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
          ]"
          @click="handleSlotSelect(slot.id)"
        >
          {{ getSlotLabel(slot) }}
        </button>
      </div>
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
