<template>
  <div class="text-sm">
    <template v-if="normalizedValue.length > 0">
      <BookingsLocationsSlotIndicator
        :slots="normalizedValue"
        :booked-slot-ids="normalizedValue.map(s => s.id)"
        size="md"
      />
    </template>
    <span v-else class="text-gray-400">—</span>
  </div>
</template>

<script setup lang="ts">
interface SlotItem {
  id: string
  color?: string
  label?: string
  value?: string
}

interface Props {
  value?: SlotItem[] | SlotItem | null
}

const props = defineProps<Props>()

// Normalize to array for consistent handling
const normalizedValue = computed<SlotItem[]>(() => {
  if (!props.value) return []
  const arr = Array.isArray(props.value) ? props.value : [props.value]
  // Ensure each item has an id
  return arr.map((item, index) => ({
    id: item.id || `slot-${index}`,
    color: item.color,
    label: item.label || item.value
  }))
})
</script>
