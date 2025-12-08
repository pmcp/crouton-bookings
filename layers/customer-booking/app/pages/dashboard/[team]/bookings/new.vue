<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div class="h-[calc(100vh-3rem)]">
    <BookingSidebarPanel size="xl" />
  </div>
</template>
