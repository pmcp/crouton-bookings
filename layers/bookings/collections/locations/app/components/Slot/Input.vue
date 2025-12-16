<script setup lang="ts">
import { nanoid } from 'nanoid'

const { t } = useI18n()

interface BookingsLocationsSlotItem {
  id: string
  label?: string
  value?: string
  color?: string
}

const model = defineModel<BookingsLocationsSlotItem>()

// Ensure stable ID on first creation
if (model.value && !model.value.id) {
  model.value = { ...model.value, id: nanoid() }
}

// Preset color options
const colorOptions = [
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Red', value: '#ef4444' },
]
</script>

<template>
  <div v-if="model" class="flex items-center gap-2">
    <UInput
      v-model="model.label"
      class="flex-1"
      size="xl"
      :placeholder="t('placeholders.enterLabel')"
    />
    <USelect
      v-model="model.color"
      :items="colorOptions"
      :placeholder="t('placeholders.color')"
      class="w-32"
      size="xl"
    >
      <template #leading>
        <span
          v-if="model.color"
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: model.color }"
        />
      </template>
      <template #item-leading="{ item }">
        <span
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: item.value }"
        />
      </template>
    </USelect>
  </div>
</template>
