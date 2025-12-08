<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { LocationData } from '../../types/booking'

interface Props {
  locations: LocationData[]
  modelValue: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const tabItems = computed<TabsItem[]>(() => {
  return props.locations.map(loc => ({
    label: loc.title,
    value: loc.id,
    icon: 'i-lucide-map-pin',
  }))
})

const activeLocation = computed({
  get: () => props.modelValue || props.locations[0]?.id || '',
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <UTabs
    v-model="activeLocation"
    :items="tabItems"
    :content="false"
    variant="pill"
    color="neutral"
    :ui="{
      list: 'flex-wrap gap-1',
      trigger: 'whitespace-nowrap',
    }"
  />
</template>
