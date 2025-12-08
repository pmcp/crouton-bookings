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
        <UFormField label="Name" name="name" class="not-last:pb-4">
          <UInput v-model="state.name" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Subject" name="subject" class="not-last:pb-4">
          <UInput v-model="state.subject" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Body" name="body" class="not-last:pb-4">
          <UTextarea v-model="state.body" class="w-full" size="xl" />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
        <UFormField label="FromEmail" name="fromEmail" class="not-last:pb-4">
          <UInput v-model="state.fromEmail" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="TriggerType" name="triggerType" class="not-last:pb-4">
          <UInput v-model="state.triggerType" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="DaysOffset" name="daysOffset" class="not-last:pb-4">
          <UInputNumber v-model="state.daysOffset" class="w-full" />
        </UFormField>
        <UFormField label="LocationId" name="locationId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.locationId"
            collection="bookingsLocations"
            label="LocationId"
          />
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
import type { BookingsEmailTemplateFormProps, BookingsEmailTemplateFormData } from '../../types'

const props = defineProps<BookingsEmailTemplateFormProps>()
const { defaultValue, schema, collection } = useBookingsEmailTemplates()

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

const state = ref<BookingsEmailTemplateFormData & { id?: string | null }>(initialValues)

const handleSubmit = async () => {
  try {
    if (props.action === 'create') {
      await create(state.value)
    } else if (props.action === 'update' && state.value.id) {
      await update(state.value.id, state.value)
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