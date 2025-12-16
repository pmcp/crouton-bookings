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
  >
    <CroutonFormLayout>
      <template #main>
      <div class="flex flex-col gap-4 p-1">
        <UFormField :label="$t('bookings.collections.assets.fields.filename')" name="filename" class="not-last:pb-4">
          <UInput v-model="state.filename" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="$t('bookings.collections.assets.fields.pathname')" name="pathname" class="not-last:pb-4">
          <UInput v-model="state.pathname" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="$t('bookings.collections.assets.fields.alt')" name="alt" class="not-last:pb-4">
          <UInput v-model="state.alt" class="w-full" size="xl" />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
        <UFormField :label="$t('bookings.collections.assets.fields.contentType')" name="contentType" class="not-last:pb-4">
          <UInput v-model="state.contentType" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="$t('bookings.collections.assets.fields.size')" name="size" class="not-last:pb-4">
          <UInputNumber v-model="state.size" class="w-full" />
        </UFormField>
      </div>
      </template>

      <template #footer>
        <CroutonFormActionButton
          :action="action"
          :collection="collection"
          :items="items"
          :loading="loading"
        />
      </template>
    </CroutonFormLayout>
  </UForm>
</template>

<script setup lang="ts">
import type { BookingsAssetFormProps, BookingsAssetFormData } from '../../types'

const props = defineProps<BookingsAssetFormProps>()
const { defaultValue, schema, collection } = useBookingsAssets()

// Form layout configuration
const tabs = ref(false)



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
  if (initialValues.uploadedAt) {
    initialValues.uploadedAt = new Date(initialValues.uploadedAt)
  }
}

const state = ref<BookingsAssetFormData & { id?: string | null }>(initialValues)

const handleSubmit = async () => {
  try {
    // Serialize Date objects to ISO strings for API submission
    const serializedData = { ...state.value }
    if (serializedData.uploadedAt instanceof Date) {
      serializedData.uploadedAt = serializedData.uploadedAt.toISOString()
    }

    if (props.action === 'create') {
      await create(serializedData)
    } else if (props.action === 'update' && state.value.id) {
      await update(state.value.id, serializedData)
    } else if (props.action === 'delete') {
      await deleteItems(props.items)
    }

    close()

  } catch (error) {
    console.error('Form submission failed:', error)
    // You can add toast notification here if available
    // toast.add({ title: 'Error', description: 'Failed to submit form', color: 'red' })
  }
}
</script>