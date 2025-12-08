<template>
  <div class="w-full">
    <!-- Error state -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-lucide-alert-triangle"
      title="Unable to load options"
      :description="error.message || 'An error occurred'"
      class="mb-2"
    />

    <!-- Loading state -->
    <USkeleton v-else-if="pending" class="h-10 w-full" />

    <!-- Select menu -->
    <USelectMenu
      v-else
      v-model="selectedValue"
      :items="options"
      value-key="value"
      label-key="label"
      :placeholder="placeholder || `Select ${label}`"
      :loading="pending"
      :disabled="!!error"
      size="xl"
      class="w-full"
    >
      <template #item-label="{ item }">
        <span>{{ item.label || item.value }}</span>
      </template>

      <template v-if="creatable" #content-top>
        <div class="p-1">
          <UButton
            color="neutral"
            icon="i-lucide-plus"
            variant="soft"
            block
            @click="openCreateModal"
          >
            Create new {{ label }}
          </UButton>
        </div>
      </template>
    </USelectMenu>

    <!-- Create option modal -->
    <UModal v-model:open="createModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Create new {{ label }}</h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                @click="createModalOpen = false"
              />
            </div>
          </template>

          <div class="flex flex-col gap-4">
            <UFormField label="Label" required>
              <UInput
                v-model="newOption.label"
                placeholder="Display name"
                size="xl"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Value">
              <UInput
                v-model="newOption.value"
                :placeholder="slugifiedLabel"
                size="xl"
                class="w-full"
              />
              <template #hint>
                <span class="text-xs text-neutral-500">Leave empty to auto-generate from label</span>
              </template>
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="createModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                :loading="creating"
                :disabled="!newOption.label"
                @click="createOption"
              >
                Create
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from 'nanoid'

interface OptionItem {
  id: string
  value: string
  label: string
}

interface Props {
  modelValue: string | null | undefined
  optionsCollection: string // e.g., "bookingsSettings"
  optionsField: string // e.g., "statuses"
  label: string
  creatable?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  creatable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null | undefined]
}>()

const toast = useToast()

// Fetch settings data
const { items, pending, error, refresh } = await useCollectionQuery(props.optionsCollection)

// Get options from the specific field in the settings record
const options = computed<OptionItem[]>(() => {
  // Settings collection should have one record per team
  const settingsRecord = items.value?.[0]
  if (!settingsRecord) return []

  const fieldData = settingsRecord[props.optionsField]
  if (!Array.isArray(fieldData)) return []

  return fieldData.map((item: any) => ({
    id: item.id || nanoid(),
    value: item.value || item.label?.toLowerCase().replace(/\s+/g, '-') || '',
    label: item.label || item.value || ''
  }))
})

// Two-way binding for v-model
// With value-key="value", USelectMenu emits the value string directly
// Convert null <-> undefined for USelectMenu compatibility
const selectedValue = computed({
  get: () => props.modelValue ?? undefined,
  set: (value: string | undefined) => {
    emit('update:modelValue', value ?? null)
  }
})

// Create modal state
const createModalOpen = ref(false)
const creating = ref(false)
const newOption = ref({
  label: '',
  value: ''
})

const slugifiedLabel = computed(() => {
  return newOption.value.label
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
})

const openCreateModal = () => {
  newOption.value = { label: '', value: '' }
  createModalOpen.value = true
}

const createOption = async () => {
  if (!newOption.value.label) return

  creating.value = true

  try {
    const { create, update } = useCollectionMutation(props.optionsCollection)
    let settingsRecord = items.value?.[0]

    // Build the new option
    const optionToAdd: OptionItem = {
      id: nanoid(),
      value: newOption.value.value || slugifiedLabel.value,
      label: newOption.value.label
    }

    // If no settings record exists, create one with the new option
    if (!settingsRecord?.id) {
      await create({
        [props.optionsField]: [optionToAdd]
      })
    } else {
      // Get current options and add new one
      const currentOptions = settingsRecord[props.optionsField] || []
      const updatedOptions = [...currentOptions, optionToAdd]

      // Update the settings record
      await update(settingsRecord.id, {
        [props.optionsField]: updatedOptions
      })
    }

    // Refresh to get latest data
    await refresh()

    // Select the new option
    emit('update:modelValue', optionToAdd.value)

    // Close modal and reset
    createModalOpen.value = false
    newOption.value = { label: '', value: '' }

    toast.add({
      title: 'Option created',
      description: `"${optionToAdd.label}" has been added`,
      color: 'success'
    })
  } catch (err: any) {
    console.error('Failed to create option:', err)
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to create option',
      color: 'error'
    })
  } finally {
    creating.value = false
  }
}

// Refresh on mount
onMounted(() => {
  refresh()
})
</script>
