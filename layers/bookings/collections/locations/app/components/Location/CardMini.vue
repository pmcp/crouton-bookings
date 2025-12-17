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
  <div class="@container flex flex-col items-center">
    <span class="text-xs font-medium truncate max-w-[80px] @[80px]:max-w-[120px]">{{ title }}</span>
    <BookingsLocationsSlotIndicator
      v-if="displaySlots.length > 0"
      :slots="displaySlots"
      :booked-slot-ids="displaySlots.map(s => s.id)"
      size="xs"
      class="hidden @[60px]:flex mt-0.5"
    />
  </div>
</template>
