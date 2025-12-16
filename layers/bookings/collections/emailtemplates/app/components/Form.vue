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
        <UFormField :label="t('bookings.emailTemplates.form.templateName')" name="name" class="not-last:pb-4">
          <UInput v-model="state.name" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="t('bookings.emailTemplates.form.emailSubject')" name="subject" class="not-last:pb-4" :help="t('bookings.emailTemplates.form.emailSubjectHelp')">
          <UInput v-model="state.subject" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="t('bookings.emailTemplates.form.emailBody')" name="body" class="not-last:pb-4" :help="t('bookings.emailTemplates.form.emailBodyHelp')">
          <CroutonEditorSimple v-model="state.body" />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
        <UFormField :label="t('bookings.emailTemplates.form.active')" name="isActive" class="not-last:pb-4">
          <USwitch v-model="state.isActive" />
        </UFormField>
        <UFormField :label="t('bookings.emailTemplates.form.triggerType')" name="triggerType" class="not-last:pb-4">
          <USelect
            v-model="state.triggerType"
            :items="triggerOptions"
            value-key="value"
            class="w-full"
            size="xl"
          />
        </UFormField>
        <UFormField :label="t('bookings.emailTemplates.form.sendTo')" name="recipientType" class="not-last:pb-4">
          <USelect
            v-model="state.recipientType"
            :items="recipientOptions"
            value-key="value"
            class="w-full"
            size="xl"
          />
        </UFormField>
        <UFormField :label="t('bookings.emailTemplates.form.hoursOffset')" name="hoursOffset" class="not-last:pb-4" :help="t('bookings.emailTemplates.form.hoursOffsetHelp')">
          <UInputNumber v-model="state.hoursOffset" class="w-full" />
        </UFormField>
        <UFormField :label="t('bookings.emailTemplates.form.fromEmail')" name="fromEmail" class="not-last:pb-4">
          <UInput v-model="state.fromEmail" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="t('bookings.emailTemplates.form.locationOptional')" name="locationId" class="not-last:pb-4" :help="t('bookings.emailTemplates.form.locationHelp')">
          <CroutonFormReferenceSelect
            v-model="state.locationId"
            collection="bookingsLocations"
            :label="t('bookings.form.location')"
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

const { t } = useI18n()
const props = defineProps<BookingsEmailTemplateFormProps>()
const { defaultValue, schema, collection } = useBookingsEmailTemplates()

const triggerOptions = computed(() => [
  { label: t('bookings.emailTemplates.triggers.bookingConfirmed'), value: 'booking_confirmed' },
  { label: t('bookings.emailTemplates.triggers.reminderBefore'), value: 'reminder_before' },
  { label: t('bookings.emailTemplates.triggers.bookingCancelled'), value: 'booking_cancelled' },
  { label: t('bookings.emailTemplates.triggers.followUpAfter'), value: 'follow_up_after' },
])

const recipientOptions = computed(() => [
  { label: t('bookings.emailTemplates.recipients.customer'), value: 'customer' },
  { label: t('bookings.emailTemplates.recipients.admin'), value: 'admin' },
  { label: t('bookings.emailTemplates.recipients.both'), value: 'both' },
])

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
