<script setup lang="ts">
interface BookingInput {
  id: string
  location: string
  date: string | Date
  slot: string[] | string | null
  group?: string | null
  status: string
}

interface Props {
  booking: BookingInput
}

const props = defineProps<Props>()
const { currentTeam } = useTeam()

// Fetch location data
const { data: locationData } = useFetch<any[]>(
  () => `/api/teams/${currentTeam.value?.id}/bookings-locations?ids=${props.booking.location}`,
  {
    key: `booking-location-${props.booking.id}`,
    immediate: !!currentTeam.value?.id && !!props.booking.location
  }
)

// Fetch settings for groups
const { data: settingsData } = useFetch<any[]>(
  () => `/api/teams/${currentTeam.value?.id}/bookings-settings`,
  {
    key: 'bookings-settings-groups'
  }
)

const groupOptions = computed(() => settingsData.value?.[0]?.groups ?? [])

// Merge booking with location data
const bookingWithLocation = computed(() => ({
  ...props.booking,
  locationData: locationData.value?.[0] || undefined
}))
</script>

<template>
  <BookingsBookingsCard
    :booking="bookingWithLocation"
    :group-options="groupOptions"
    :show-address="false"
  />
</template>
