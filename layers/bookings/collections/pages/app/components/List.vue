<template>
  <CroutonCollection
    :layout="layout"
    collection="bookingsPages"
    :columns="columns"
    :rows="pages || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="BookingsPages"
        :collection="'bookingsPages'"
        createButton
      />
    </template>
    <template #featuredImageId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.featuredImageId"
        :id="row.original.featuredImageId"
        collection="bookingsAssets"
      />
    </template>
    <template #publishedAt-cell="{ row }">
      <CroutonDate :date="row.original.publishedAt"></CroutonDate>
    </template>
    <template #excerpt-cell="{ row }">
      <CroutonEditorPreview :content="row.original.excerpt" />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = useBookingsPages()

const { items: pages, pending } = await useCollectionQuery(
  'bookingsPages'
)
</script>