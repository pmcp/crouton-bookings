<script setup lang="ts">
import type { LocationData } from '../../types/booking'

interface Props {
  location: LocationData | null
}

const props = defineProps<Props>()

const fullAddress = computed(() => {
  if (!props.location) return ''
  return [
    props.location.street,
    props.location.zip,
    props.location.city,
  ].filter(Boolean).join(', ')
})

const hasContent = computed(() => {
  return props.location?.content && props.location.content.trim().length > 0
})
</script>

<template>
  <div v-if="location" class="space-y-4">
    <!-- Address -->
    <div v-if="fullAddress" class="flex items-start gap-2 text-sm text-muted">
      <UIcon name="i-lucide-map-pin" class="w-4 h-4 mt-0.5 shrink-0" />
      <span>{{ fullAddress }}</span>
    </div>

    <!-- Rich text content -->
    <div
      v-if="hasContent"
      class="prose prose-sm dark:prose-invert max-w-none"
      v-html="location.content"
    />

    <!-- No content placeholder -->
    <div v-else class="text-sm text-muted italic">
      No additional information available.
    </div>
  </div>
</template>
