<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsEmailTemplates"
    :columns="columns"
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
  </CroutonCollection>
</template>

<script setup lang="ts">
import useBookingsEmailTemplates from '../composables/useBookingsEmailTemplates'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsEmailTemplates()

const { items: emailtemplates, pending } = await useCollectionQuery(
  'bookingsEmailTemplates'
)
</script>