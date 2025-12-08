<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsBookings"
    :columns="columns"
    :rows="bookings || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="BookingsBookings"
        :collection="'bookingsBookings'"
        createButton
      />
    </template>
    <template #location-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.location"
        :id="row.original.location"
        collection="bookingsLocations"
      />
    </template>
    <template #date-cell="{ row }">
      <CroutonDate :date="row.original.date"></CroutonDate>
    </template>
    <template #slot-cell="{ row }">
      <CroutonDependentFieldCardMini
        v-if="row.original.slot && row.original.location"
        :value="row.original.slot"
        :dependent-value="row.original.location"
        dependent-collection="bookingsLocations"
        dependent-field="slots"
      />
      <span v-else class="text-gray-400">—</span>
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsBookings()

const { items: bookings, pending } = await useCollectionQuery(
  'bookingsBookings'
)
</script>