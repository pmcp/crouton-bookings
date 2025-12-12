<script setup lang="ts">
import { nanoid } from 'nanoid'

interface BookingsSettingsStatuseItem {
  id: string
  label: string
  value: string
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

const model = defineModel<BookingsSettingsStatuseItem>()

// Color options for the select
const colorOptions = [
  { label: 'Green (Success)', value: 'success' },
  { label: 'Yellow (Warning)', value: 'warning' },
  { label: 'Red (Error)', value: 'error' },
  { label: 'Blue (Info)', value: 'info' },
  { label: 'Gray (Neutral)', value: 'neutral' },
]

// Ensure stable ID and defaults on first creation
if (model.value && !model.value.id) {
  model.value = {
    ...model.value,
    id: nanoid(),
    color: model.value.color || 'neutral',
  }
}

// Auto-generate value from label
watch(() => model.value?.label, (newLabel) => {
  if (newLabel && model.value && !model.value.value) {
    model.value.value = newLabel.toLowerCase().replace(/\s+/g, '-')
  }
})
</script>

<template>
  <div class="flex gap-2 items-end">
    <UFormField label="Label" class="flex-1">
      <UInput
        v-model="model.label"
        class="w-full"
        placeholder="e.g., Confirmed"
      />
    </UFormField>
    <UFormField label="Value" class="flex-1">
      <UInput
        v-model="model.value"
        class="w-full"
        placeholder="e.g., confirmed"
      />
    </UFormField>
    <UFormField label="Color" class="w-40">
      <USelect
        v-model="model.color"
        :items="colorOptions"
        placeholder="Select color"
      />
    </UFormField>
  </div>
</template>
