<script setup lang="ts">
interface SlotItem {
  id: string
  color?: string
  label?: string
}

interface Props {
  slots: SlotItem[]
  bookedSlotIds?: string[]
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  bookedSlotIds: () => [],
  size: 'md'
})

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
}

function isBooked(slotId: string): boolean {
  return props.bookedSlotIds?.includes(slotId) ?? false
}
</script>

<template>
  <div class="flex gap-1 items-center">
    <div
      v-for="slot in slots"
      :key="slot.id"
      class="rounded-full transition-colors"
      :class="[
        sizeClasses[size],
        isBooked(slot.id) ? '' : 'opacity-30'
      ]"
      :style="{ backgroundColor: slot.color || '#94a3b8' }"
      :title="slot.label"
    />
  </div>
</template>
