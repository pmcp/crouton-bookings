<script setup lang="ts">
interface SlotItem {
  id: string
  color?: string
  label?: string
  value?: string
}

interface Props {
  title: string
  slots?: SlotItem[]
}

const props = withDefaults(defineProps<Props>(), {
  slots: () => [],
})

// Filter out all-day slot for display
const displaySlots = computed(() =>
  props.slots.filter(s => s.id !== 'all-day')
)
</script>

<template>
  <div class="flex flex-col items-center">
    <span class="text-xs font-medium mb-1 truncate max-w-[120px]">{{ title }}</span>
    <BookingsLocationsSlotIndicator
      v-if="displaySlots.length > 0"
      :slots="displaySlots"
      :booked-slot-ids="displaySlots.map(s => s.id)"
      size="sm"
    />
  </div>
</template>
