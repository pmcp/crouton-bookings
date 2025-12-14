<template>
  <CroutonCollection
    collection="translationsUi"
    :columns="columns"
    :rows="translations || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="Translations"
        collection="translationsUi"
        createButton
      />
    </template>
    <template #values-cell="{ row }">
      <div class="flex flex-wrap gap-1">
        <UBadge
          v-for="(value, locale) in row.original.values"
          :key="locale"
          variant="subtle"
          size="xs"
        >
          {{ locale }}
        </UBadge>
      </div>
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
const { columns } = useTranslationsUi()

const { items: translations, pending } = await useCollectionQuery(
  'translationsUi'
)
</script>
