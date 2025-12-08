<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const teamId = computed(() => route.params.team as string)
</script>

<template>
  <AppContainer title="My Bookings">
    <template #actions>
      <UButton :to="`/dashboard/${teamId}/bookings/new`">
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-2" />
        Book Now
      </UButton>
    </template>

    <MyBookingsList />
  </AppContainer>
</template>
