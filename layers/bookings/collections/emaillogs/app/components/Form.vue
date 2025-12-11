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
        <UFormField label="BookingId" name="bookingId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.bookingId"
            collection="bookingsBookings"
            label="BookingId"
          />
        </UFormField>
        <UFormField label="TemplateId" name="templateId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.templateId"
            collection="bookingsEmailTemplates"
            label="TemplateId"
          />
        </UFormField>
        <UFormField label="RecipientEmail" name="recipientEmail" class="not-last:pb-4">
          <UInput v-model="state.recipientEmail" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="TriggerType" name="triggerType" class="not-last:pb-4">
          <UInput v-model="state.triggerType" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Error" name="error" class="not-last:pb-4">
          <UTextarea v-model="state.error" class="w-full" size="xl" />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
      </div>
      <div class="flex flex-col gap-4 p-1">
        <UFormField label="Status" name="status" class="not-last:pb-4">
          <UInput v-model="state.status" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="SentAt" name="sentAt" class="not-last:pb-4">
          <UInput v-model="state.sentAt" class="w-full" size="xl" />
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
import type { BookingsEmailLogFormProps, BookingsEmailLogFormData } from '../../types'
import useBookingsEmailLogs from '../composables/useBookingsEmailLogs'

const props = defineProps<BookingsEmailLogFormProps>()
const { defaultValue, schema, collection } = useBookingsEmailLogs()

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

const state = ref<BookingsEmailLogFormData & { id?: string | null }>(initialValues)

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