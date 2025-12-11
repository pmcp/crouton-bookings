<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsEmailLogs"
    :columns="columns"
    :rows="emaillogs || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="BookingsEmailLogs"
        :collection="'bookingsEmailLogs'"
        createButton
      />
    </template>
    <template #bookingId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.bookingId"
        :id="row.original.bookingId"
        collection="bookingsBookings"
      />
    </template>
    <template #templateId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.templateId"
        :id="row.original.templateId"
        collection="bookingsEmailTemplates"
      />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import useBookingsEmailLogs from '../composables/useBookingsEmailLogs'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsEmailLogs()

const { items: emaillogs, pending } = await useCollectionQuery(
  'bookingsEmailLogs'
)
</script>