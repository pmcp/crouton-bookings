<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsEmailTemplates"
    :columns="columnsWithActions"
    :rows="emailtemplates || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="BookingsEmailTemplates"
        :collection="'bookingsEmailTemplates'"
        createButton
      />
    </template>
    <template #locationId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.locationId"
        :id="row.original.locationId"
        collection="bookingsLocations"
      />
    </template>
    <template #actions-cell="{ row }">
      <UButton
        icon="i-heroicons-paper-airplane"
        size="xs"
        variant="ghost"
        :loading="testingId === row.original.id"
        @click.stop="sendTestEmail(row.original)"
      >
        Test
      </UButton>
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import useBookingsEmailTemplates from '../composables/useBookingsEmailTemplates'
import type { BookingsEmailTemplate } from '../../types'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsEmailTemplates()
const toast = useToast()
const { currentTeam } = useTeam()

// Add actions column
const columnsWithActions = computed(() => [
  ...columns,
  { accessorKey: 'actions', header: 'Actions' }
])

// Track which template is being tested
const testingId = ref<string | null>(null)

async function sendTestEmail(template: BookingsEmailTemplate) {
  if (!currentTeam.value?.id) return

  testingId.value = template.id
  try {
    const result = await $fetch(`/api/teams/${currentTeam.value.id}/bookings-emailtemplates/${template.id}/test`, {
      method: 'POST'
    })
    toast.add({
      title: 'Test email sent',
      description: `Sent to ${result.sentTo}`,
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Failed to send test email',
      description: error.data?.message || error.message,
      color: 'error'
    })
  } finally {
    testingId.value = null
  }
}

const { items: emailtemplates, pending } = await useCollectionQuery(
  'bookingsEmailTemplates'
)
</script>