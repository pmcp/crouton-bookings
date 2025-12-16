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
        <UFormField :label="$t('bookings.collections.settings.fields.enableGroups')" name="enableGroups" class="not-last:pb-4">
          <USwitch v-model="state.enableGroups" />
          <template #description>
            {{ $t('bookings.collections.settings.fields.enableGroupsDescription') }}
          </template>
        </UFormField>

        <UFormField v-if="state.enableGroups" :label="$t('bookings.collections.settings.fields.groups')" name="groups" class="not-last:pb-4">
          <CroutonFormRepeater
            v-model="state.groups"
            component-name="BookingsSettingsGroupInput"
            :add-label="$t('bookings.collections.settings.fields.addGroup')"
            :sortable="true"
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
import type { BookingsSettingFormProps, BookingsSettingFormData } from '../../types'

const props = defineProps<BookingsSettingFormProps>()
const { defaultValue, schema, collection } = useBookingsSettings()

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

const state = ref<BookingsSettingFormData & { id?: string | null }>(initialValues)

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