<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsAssets"
    :columns="columns"
    :rows="assets || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="BookingsAssets"
        :collection="'bookingsAssets'"
        createButton
      />
    </template>
    <template #uploadedAt-cell="{ row }">
      <CroutonDate :date="row.original.uploadedAt"></CroutonDate>
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsAssets()

const { items: assets, pending } = await useCollectionQuery(
  'bookingsAssets'
)
</script>