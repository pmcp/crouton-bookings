<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const { isExpanded } = useBookingCart()

// Open XL mode and redirect to team dashboard
isExpanded.value = true
await navigateTo(`/dashboard/${route.params.team}`, { replace: true })
</script>

<template>
  <div />
</template>
