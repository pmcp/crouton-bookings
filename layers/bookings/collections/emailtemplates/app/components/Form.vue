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
        <UFormField label="Template Name" name="name" class="not-last:pb-4">
          <UInput v-model="state.name" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Email Subject" name="subject" class="not-last:pb-4" help="Variables: {{customer_name}}, {{booking_date}}, {{booking_slot}}, {{location_name}}, {{team_name}}">
          <UInput v-model="state.subject" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Email Body" name="body" class="not-last:pb-4" help="Variables: {{customer_name}}, {{booking_date}}, {{booking_slot}}, {{location_name}}, {{location_address}}, {{team_name}}">
          <CroutonEditorSimple v-model="state.body" />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
        <UFormField label="Active" name="isActive" class="not-last:pb-4">
          <USwitch v-model="state.isActive" />
        </UFormField>
        <UFormField label="Trigger Type" name="triggerType" class="not-last:pb-4">
          <USelect
            v-model="state.triggerType"
            :items="triggerOptions"
            value-key="value"
            class="w-full"
            size="xl"
          />
        </UFormField>
        <UFormField label="Send To" name="recipientType" class="not-last:pb-4">
          <USelect
            v-model="state.recipientType"
            :items="recipientOptions"
            value-key="value"
            class="w-full"
            size="xl"
          />
        </UFormField>
        <UFormField label="Hours Offset" name="hoursOffset" class="not-last:pb-4" help="Negative = before booking, Positive = after booking. Only used for reminder/follow-up triggers.">
          <UInputNumber v-model="state.hoursOffset" class="w-full" />
        </UFormField>
        <UFormField label="From Email" name="fromEmail" class="not-last:pb-4">
          <UInput v-model="state.fromEmail" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Location (optional)" name="locationId" class="not-last:pb-4" help="Leave empty to apply to all locations">
          <CroutonFormReferenceSelect
            v-model="state.locationId"
            collection="bookingsLocations"
            label="Location"
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
import useBookingsEmailTemplates from '../composables/useBookingsEmailTemplates'

const props = defineProps<BookingsEmailTemplateFormProps>()
const { defaultValue, schema, collection } = useBookingsEmailTemplates()

const triggerOptions = [
  { label: 'Booking Confirmed', value: 'booking_confirmed' },
  { label: 'Reminder Before', value: 'reminder_before' },
  { label: 'Booking Cancelled', value: 'booking_cancelled' },
  { label: 'Follow-up After', value: 'follow_up_after' },
]

const recipientOptions = [
  { label: 'Customer', value: 'customer' },
  { label: 'Admin', value: 'admin' },
  { label: 'Both', value: 'both' },
]

// Use new mutation composable for data operations
const { create, update, deleteItems } = useCollectionMutation(collection)

// useCrouton still manages modal state
const { close } = useCrouton()

// Initialize form state with proper values
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
  }
}
</script>
