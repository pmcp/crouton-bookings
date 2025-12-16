<script setup lang="ts">
import { nanoid } from 'nanoid'

const { t } = useI18n()

interface BookingsSettingsStatuseItem {
  id: string
  label: string
  value: string
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

const model = defineModel<BookingsSettingsStatuseItem>()

// Color options for the select
const colorOptions = computed(() => [
  { label: t('bookings.colors.greenSuccess'), value: 'success' },
  { label: t('bookings.colors.yellowWarning'), value: 'warning' },
  { label: t('bookings.colors.redError'), value: 'error' },
  { label: t('bookings.colors.blueInfo'), value: 'info' },
  { label: t('bookings.colors.grayNeutral'), value: 'neutral' },
])

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
    <UFormField :label="t('common.label')" class="flex-1">
      <UInput
        v-model="model.label"
        class="w-full"
        :placeholder="t('placeholders.exampleConfirmed')"
      />
    </UFormField>
    <UFormField :label="t('common.value')" class="flex-1">
      <UInput
        v-model="model.value"
        class="w-full"
        :placeholder="t('placeholders.exampleValueConfirmed')"
      />
    </UFormField>
    <UFormField :label="t('common.color')" class="w-40">
      <USelect
        v-model="model.color"
        :items="colorOptions"
        :placeholder="t('placeholders.selectColor')"
      />
    </UFormField>
  </div>
</template>
