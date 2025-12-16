<template>
  <div>
    <!-- Header with layout toggle -->
    <div class="flex items-center justify-between mb-4">
      <CroutonTableHeader
        title="BookingsBookings"
        :collection="'bookingsBookings'"
        createButton
      />
      <div class="flex gap-1">
        <UButton
          :variant="currentLayout === 'table' ? 'solid' : 'ghost'"
          color="neutral"
          size="xs"
          icon="i-lucide-table"
          @click="currentLayout = 'table'"
        />
        <UButton
          :variant="currentLayout === 'cards' ? 'solid' : 'ghost'"
          color="neutral"
          size="xs"
          icon="i-lucide-layout-grid"
          @click="currentLayout = 'cards'"
        />
      </div>
    </div>

    <!-- Table Layout -->
    <CroutonCollection
      v-if="currentLayout === 'table'"
      layout="table"
      collection="bookingsBookings"
      :columns="columns"
      :rows="bookings || []"
      :loading="pending"
    >
      <template #location-cell="{ row }">
        <CroutonItemCardMini
          v-if="row.original.location"
          :id="row.original.location"
          collection="bookingsLocations"
        />
      </template>
      <template #date-cell="{ row }">
        <CroutonDate :date="row.original.date" />
      </template>
      <template #slot-cell="{ row }">
        <BookingsBookingsSlotCell
          v-if="row.original.slot && row.original.location"
          :slot-ids="row.original.slot"
          :location-id="row.original.location"
        />
        <span v-else class="text-gray-400">—</span>
      </template>
      <template #group-cell="{ row }">
        <CroutonOptionsFieldCardMini
          v-if="row.original.group"
          :value="row.original.group"
          options-collection="bookingsSettings"
          options-field="groups"
        />
        <span v-else class="text-gray-400">—</span>
      </template>
    </CroutonCollection>

    <!-- Cards Layout -->
    <div v-else-if="currentLayout === 'cards'">
      <div v-if="pending" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-muted animate-spin mx-auto" />
      </div>
      <div v-else-if="!bookings?.length" class="text-center py-12 text-muted">
        No bookings found
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BookingsBookingsCardWithData
          v-for="booking in bookings"
          :key="booking.id"
          :booking="booking"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  layout?: 'table' | 'cards'
}>(), {
  layout: 'table'
})

const currentLayout = ref(props.layout)

const { columns } = useBookingsBookings()

const { items: bookings, pending } = await useCollectionQuery(
  'bookingsBookings'
)
</script>
