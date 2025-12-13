<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <!-- Middleware redirects before this renders -->
  <div>Redirecting...</div>
</template>
