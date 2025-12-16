<script setup lang="ts">
interface SlotItem {
  id: string
  color?: string
  label?: string
}

interface LocationWithBookings {
  id: string
  title: string
  slots: SlotItem[]
  bookedSlotIds: string[]
}

interface Props {
  locations: LocationWithBookings[]
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  compact: false
})
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="location in locations"
      :key="location.id"
      class="flex items-center gap-2"
    >
      <span
        v-if="!compact"
        class="text-sm text-gray-600 dark:text-gray-400 w-24 truncate"
      >
        {{ location.title }}
      </span>
      <BookingsLocationsSlotIndicator
        :slots="location.slots"
        :booked-slot-ids="location.bookedSlotIds"
        :size="compact ? 'sm' : 'md'"
      />
    </div>
  </div>
</template>
