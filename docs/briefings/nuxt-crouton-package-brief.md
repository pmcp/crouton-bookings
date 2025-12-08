# nuxt-crouton Package Brief: CroutonFormOptionsSelect Component

## Overview

Add a new component to the nuxt-crouton package that enables admin-configurable dropdown selects with inline option creation.

## Component: CroutonFormOptionsSelect

### Location
`app/components/FormOptionsSelect.vue` (exposed as `CroutonFormOptionsSelect`)

### Purpose
A dropdown select where options come from a field in another collection (typically a settings collection), with the ability to create new options inline.

### Props

```typescript
interface Props {
  modelValue: string | null | undefined
  optionsCollection: string  // Collection containing options (e.g., "bookingsSettings")
  optionsField: string       // Field name holding options array (e.g., "statuses")
  label: string              // Display label
  creatable?: boolean        // Allow inline creation (default: true)
  placeholder?: string       // Placeholder text
  multiple?: boolean         // Multi-select (future)
}
```

### Emits

```typescript
defineEmits<{
  'update:modelValue': [value: string | null | undefined]
}>()
```

### Usage

```vue
<CroutonFormOptionsSelect
  v-model="state.status"
  options-collection="bookingsSettings"
  options-field="statuses"
  label="Status"
/>
```

### Implementation

```vue
<template>
  <div class="w-full">
    <!-- Error state -->
    <UAlert v-if="error" color="error" title="Unable to load options" />

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
              <UInput v-model="newOption.label" placeholder="Display name" size="xl" class="w-full" />
            </UFormField>
            <UFormField label="Value">
              <UInput v-model="newOption.value" :placeholder="slugifiedLabel" size="xl" class="w-full" />
              <template #hint>
                <span class="text-xs text-neutral-500">Leave empty to auto-generate from label</span>
              </template>
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="createModalOpen = false">
                Cancel
              </UButton>
              <UButton color="primary" :loading="creating" :disabled="!newOption.label" @click="createOption">
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
  optionsCollection: string
  optionsField: string
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

// Fetch settings data using existing nuxt-crouton composable
const { items, pending, error, refresh } = await useCollectionQuery(props.optionsCollection)

// Extract options from the specific field
const options = computed<OptionItem[]>(() => {
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

// Two-way binding (convert null <-> undefined for USelectMenu)
const selectedValue = computed({
  get: () => props.modelValue ?? undefined,
  set: (value: string | undefined) => {
    emit('update:modelValue', value ?? null)
  }
})

// Create modal state
const createModalOpen = ref(false)
const creating = ref(false)
const newOption = ref({ label: '', value: '' })

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

    const optionToAdd: OptionItem = {
      id: nanoid(),
      value: newOption.value.value || slugifiedLabel.value,
      label: newOption.value.label
    }

    // Auto-create settings record if it doesn't exist
    if (!settingsRecord?.id) {
      await create({
        [props.optionsField]: [optionToAdd]
      })
    } else {
      const currentOptions = settingsRecord[props.optionsField] || []
      const updatedOptions = [...currentOptions, optionToAdd]

      await update(settingsRecord.id, {
        [props.optionsField]: updatedOptions
      })
    }

    await refresh()
    emit('update:modelValue', optionToAdd.value)

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

onMounted(() => {
  refresh()
})
</script>
```

## Dependencies

Uses existing nuxt-crouton composables:
- `useCollectionQuery()` - fetch data
- `useCollectionMutation()` - create/update data
- `useToast()` - notifications

Uses Nuxt UI components:
- `USelectMenu`
- `UModal`
- `UCard`
- `UButton`
- `UInput`
- `UFormField`
- `UAlert`
- `USkeleton`

## Key Behaviors

1. **Auto-creates settings record** - If no settings record exists when creating first option, creates one automatically
2. **Auto-selects new option** - After creating an option, it's automatically selected
3. **Slugifies value** - If value field left empty, generates from label (e.g., "Year 6" → "year-6")
4. **Handles null/undefined** - Converts between `null` (form state) and `undefined` (USelectMenu)

## Comparison with CroutonFormReferenceSelect

| Aspect | ReferenceSelect | OptionsSelect |
|--------|-----------------|---------------|
| Data source | Entire collection | Field within a record |
| Create method | Full Crouton modal | Simple inline modal |
| Use case | Foreign key references | Configurable option lists |
| Stored value | Record ID | Option value string |

## Testing

1. Render with no settings record → should show empty dropdown
2. Click "Create new" → modal opens
3. Enter label, leave value empty → value auto-generated
4. Create option → settings record created, option selected
5. Create second option → added to existing settings record
6. Verify options persist after page reload

## Future Enhancements

- `multiple` prop for multi-select
- `color` field on options for status badges
- `icon` field on options
- Drag-drop reordering in settings
- Validation that value doesn't already exist
