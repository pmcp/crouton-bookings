<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsLocations"
    :columns="columns"
    :rows="locations || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="BookingsLocations"
        :collection="'bookingsLocations'"
        createButton
      />
    </template>
    <template #allowedMemberIds-cell="{ row }">
      <div v-if="row.original.allowedMemberIds && row.original.allowedMemberIds.length > 0" class="flex flex-wrap gap-1">
        <CroutonItemCardMini
          v-for="itemId in row.original.allowedMemberIds"
          :key="itemId"
          :id="itemId"
          collection="teamMembers"
        />
      </div>
      <span v-else class="text-gray-400">—</span>
    </template>
    <template #slots-cell="{ row }">
      <BookingsLocationsSlotCardMini :value="row.original.slots" />
    </template>
    <template #content-cell="{ row }">
      <CroutonEditorPreview :content="row.original.content" />
    </template>
    <template #location-cell="{ row }">
      <CroutonMapsPreview :location="row.original.location" />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsLocations()

const { items: locations, pending } = await useCollectionQuery(
  'bookingsLocations'
)
</script>