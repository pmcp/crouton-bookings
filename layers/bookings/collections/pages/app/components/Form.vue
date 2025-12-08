<template>
  <CroutonFormActionButton
    v-if="action === 'delete'"
    :action="action"
    :collection="collection"
    :items="items"
    :loading="loading"
    @click="handleSubmit"
  />

  <UForm
    v-else
    :schema="schema"
    :state="state"
    @submit="handleSubmit"
    @error="handleValidationError"
  >
    <CroutonFormLayout :tabs="tabs" :navigation-items="navigationItems" :tab-errors="tabErrorCounts" v-model="activeSection">
      <template #main="{ activeSection }">
      <div v-show="!tabs || activeSection === 'basic'" class="flex flex-col gap-4 p-1">
        <UFormField label="Title" name="title" class="not-last:pb-4">
          <UInput v-model="state.title" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Slug" name="slug" class="not-last:pb-4">
          <UInput v-model="state.slug" class="w-full" size="xl" />
        </UFormField>
      </div>

      <div v-show="!tabs || activeSection === 'content'" class="flex flex-col gap-4 p-1">
        <UFormField label="Content" name="content" class="not-last:pb-4">
          <CroutonEditorSimple v-model="state.content" />
        </UFormField>
        <UFormField label="Excerpt" name="excerpt" class="not-last:pb-4">
          <CroutonEditorSimple v-model="state.excerpt" />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
        <UFormField label="MetaDescription" name="metaDescription" class="not-last:pb-4">
          <UTextarea v-model="state.metaDescription" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="MetaTitle" name="metaTitle" class="not-last:pb-4">
          <UInput v-model="state.metaTitle" class="w-full" size="xl" />
        </UFormField>
      </div>

      <div class="flex flex-col gap-4 p-1">
        <UFormField label="FeaturedImageId" name="featuredImageId" class="not-last:pb-4">
          <CroutonAssetsPicker
            v-model="state.featuredImageId"
            collection="bookingsAssets"
          />
        </UFormField>
      </div>

      <div class="flex flex-col gap-4 p-1">
        <UFormField label="Status" name="status" class="not-last:pb-4">
          <UInput v-model="state.status" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="PublishedAt" name="publishedAt" class="not-last:pb-4">
          <CroutonCalendar v-model:date="state.publishedAt" />
        </UFormField>
        <UFormField label="Template" name="template" class="not-last:pb-4">
          <UInput v-model="state.template" class="w-full" size="xl" />
        </UFormField>
      </div>

      <div class="flex flex-col gap-4 p-1">
        <UFormField label="ShowInMenu" name="showInMenu" class="not-last:pb-4">
          <UCheckbox v-model="state.showInMenu" />
        </UFormField>
        <UFormField label="Order" name="order" class="not-last:pb-4">
          <UInputNumber v-model="state.order" class="w-full" />
        </UFormField>
      </div>
      </template>

      <template #footer>
        <CroutonValidationErrorSummary
          v-if="validationErrors.length > 0"
          :tab-errors="tabErrorCounts"
          :navigation-items="navigationItems"
          @switch-tab="switchToTab"
        />

        <CroutonFormActionButton
          :action="action"
          :collection="collection"
          :items="items"
          :loading="loading"
          :has-validation-errors="validationErrors.length > 0"
        />
      </template>
    </CroutonFormLayout>
  </UForm>
</template>

<script setup lang="ts">
import type { BookingsPageFormProps, BookingsPageFormData } from '../../types'

const props = defineProps<BookingsPageFormProps>()
const { defaultValue, schema, collection } = useBookingsPages()

// Form layout configuration
const navigationItems = [
  { label: 'Basic', value: 'basic' },
  { label: 'Content', value: 'content' }
]

const tabs = ref(true)
const activeSection = ref('basic')

// Map field names to their tab groups for error tracking
const fieldToGroup: Record<string, string> = {
  'title': 'basic',
  'slug': 'basic',
  'content': 'content',
  'excerpt': 'content'
}

// Track validation errors for tab indicators
const validationErrors = ref<Array<{ name: string; message: string }>>([])

// Handle form validation errors
const handleValidationError = (event: any) => {
  if (event?.errors) {
    validationErrors.value = event.errors
  }
}

// Compute errors per tab
const tabErrorCounts = computed(() => {
  const counts: Record<string, number> = {}

  validationErrors.value.forEach(error => {
    const tabName = fieldToGroup[error.name] || 'general'
    counts[tabName] = (counts[tabName] || 0) + 1
  })

  return counts
})

// Switch to a specific tab (for clicking error links)
const switchToTab = (tabValue: string) => {
  activeSection.value = tabValue
}

// Use new mutation composable for data operations
const { create, update, deleteItems } = useCollectionMutation(collection)

// useCrouton still manages modal state
const { close } = useCrouton()

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

// Convert date strings to Date objects for date fields during editing
if (props.action === 'update' && props.activeItem?.id) {
  if (initialValues.publishedAt) {
    initialValues.publishedAt = new Date(initialValues.publishedAt)
  }
}

const state = ref<BookingsPageFormData & { id?: string | null }>(initialValues)

const handleSubmit = async () => {
  try {
    // Serialize Date objects to ISO strings for API submission
    const serializedData = { ...state.value }
    if (serializedData.publishedAt instanceof Date) {
      serializedData.publishedAt = serializedData.publishedAt.toISOString()
    }

    if (props.action === 'create') {
      await create(serializedData)
    } else if (props.action === 'update' && state.value.id) {
      await update(state.value.id, serializedData)
    } else if (props.action === 'delete') {
      await deleteItems(props.items)
    }

    // Clear validation errors on successful submission
    validationErrors.value = []

    close()

  } catch (error) {
    console.error('Form submission failed:', error)
    // You can add toast notification here if available
    // toast.add({ title: 'Error', description: 'Failed to submit form', color: 'red' })
  }
}
</script>