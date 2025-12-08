<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsSettings"
    :columns="columns"
    :rows="settings || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="BookingsSettings"
        :collection="'bookingsSettings'"
        createButton
      />
    </template>
    <template #statuses-cell="{ row }">
      <BookingsSettingsStatuseCardMini :value="row.original.statuses" />
    </template>
    <template #groups-cell="{ row }">
      <BookingsSettingsGroupCardMini :value="row.original.groups" />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsSettings()

const { items: settings, pending } = await useCollectionQuery(
  'bookingsSettings'
)
</script>