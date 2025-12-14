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
        <UFormField label="Location" name="location" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.location"
            collection="bookingsLocations"
            label="Location"
          />
        </UFormField>
        <UFormField label="Date" name="date" class="not-last:pb-4">
          <BookingsCalendarWithAvailability
            v-model="state.date"
            :location-id="state.location"
            :location-slots="locationSlots"
            @available-slots-changed="availableSlots = $event"
          />
        </UFormField>
        <UFormField label="Slot" name="slot" class="not-last:pb-4">
          <BookingsSlotSelectWithAvailability
            v-model="state.slot"
            :location-id="state.location"
            :available-slots="availableSlots"
            :selected-date="state.date"
          />
        </UFormField>
        <UFormField v-if="enableGroups" label="Age Group" name="group" class="not-last:pb-4">
          <CroutonFormOptionsSelect
            v-model="state.group"
            options-collection="bookingsSettings"
            options-field="groups"
            label="Age Group"
          />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
        <UFormField label="Status" name="status" class="not-last:pb-4">
          <CroutonFormOptionsSelect
            v-model="state.status"
            options-collection="bookingsSettings"
            options-field="statuses"
            label="Status"
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
import type { BookingsBookingFormProps, BookingsBookingFormData } from '../../types'
import type { SlotOption } from '../composables/useBookingAvailability'

const props = defineProps<BookingsBookingFormProps>()
const { defaultValue, schema, collection } = useBookingsBookings()
const { currentTeam } = useTeam()

// Fetch settings to check if groups are enabled
const { items: settingsItems } = await useCollectionQuery('bookingsSettings')
const enableGroups = computed(() => settingsItems.value?.[0]?.enableGroups ?? false)

// Available slots from calendar (updates when date is selected)
const availableSlots = ref<SlotOption[]>([])

// Fetch location data to get slots configuration
const { data: locationData } = useFetch(() =>
  state.value.location
    ? `/api/teams/${currentTeam.value?.id}/bookings-locations?ids=${state.value.location}`
    : null,
  {
    watch: [() => state.value.location],
    immediate: false
  }
)

// Extract slots from location data
const locationSlots = computed<SlotOption[]>(() => {
  if (!locationData.value || !Array.isArray(locationData.value) || locationData.value.length === 0) {
    return []
  }
  const location = locationData.value[0]
  if (!location?.slots || !Array.isArray(location.slots)) {
    return []
  }
  return location.slots.map((slot: any) => ({
    id: slot.id || slot.value || String(slot),
    label: slot.label || slot.title || String(slot)
  }))
})

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
  if (initialValues.date) {
    initialValues.date = new Date(initialValues.date)
  }
}

const state = ref<BookingsBookingFormData & { id?: string | null }>(initialValues)

// Reset slot when date changes
watch(() => state.value.date, () => {
  state.value.slot = null
})

// Reset date and slot when location changes
watch(() => state.value.location, () => {
  state.value.date = null
  state.value.slot = null
  availableSlots.value = []
})

const handleSubmit = async () => {
  try {
    // Serialize Date objects to ISO strings for API submission
    const serializedData = { ...state.value }
    if (serializedData.date instanceof Date) {
      serializedData.date = serializedData.date.toISOString()
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