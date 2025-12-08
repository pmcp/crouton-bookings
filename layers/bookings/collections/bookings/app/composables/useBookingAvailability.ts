import type { DateValue } from '@internationalized/date'

export interface SlotOption {
  id: string
  label: string
}

export interface AvailabilityData {
  [dateISO: string]: {
    bookedSlots: string[]
  }
}

const ALL_DAY_SLOT: SlotOption = {
  id: 'all-day',
  label: 'All Day'
}

export function useBookingAvailability(
  locationId: Ref<string | null>,
  locationSlots: Ref<SlotOption[] | null | undefined>
) {
  const { currentTeam } = useTeam()
  const loading = ref(false)
  const availabilityData = ref<AvailabilityData>({})

  // All slots including "All Day" prepended
  const allSlots = computed<SlotOption[]>(() => {
    const slots = locationSlots.value || []
    return [ALL_DAY_SLOT, ...slots]
  })

  // Fetch availability for a date range
  async function fetchAvailability(startDate: Date, endDate: Date) {
    if (!locationId.value || !currentTeam.value?.id) return

    loading.value = true
    try {
      const data = await $fetch<AvailabilityData>(
        `/api/teams/${currentTeam.value.id}/bookings-bookings/availability`,
        {
          query: {
            locationId: locationId.value,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }
      )
      availabilityData.value = data
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      availabilityData.value = {}
    } finally {
      loading.value = false
    }
  }

  // Get booked slots for a specific date
  function getBookedSlotsForDate(date: Date | DateValue): string[] {
    const dateKey = normalizeToDateKey(date)
    return availabilityData.value[dateKey]?.bookedSlots || []
  }

  // Get booked slot objects with labels for a specific date
  function getBookedSlotLabelsForDate(date: Date | DateValue): SlotOption[] {
    const bookedIds = getBookedSlotsForDate(date)
    return allSlots.value.filter(slot => bookedIds.includes(slot.id))
  }

  // Check if a date has any bookings
  function hasBookingsOnDate(date: Date | DateValue): boolean {
    return getBookedSlotsForDate(date).length > 0
  }

  // Check if a date is fully booked
  function isDateFullyBooked(date: Date | DateValue): boolean {
    const bookedSlots = getBookedSlotsForDate(date)

    // If "all-day" is booked, the date is fully booked
    if (bookedSlots.includes('all-day')) {
      return true
    }

    // If all individual slots (excluding all-day) are booked, it's fully booked
    const individualSlots = (locationSlots.value || []).map(s => s.id)
    if (individualSlots.length === 0) return false

    return individualSlots.every(slotId => bookedSlots.includes(slotId))
  }

  // Get available slots for a specific date
  function getAvailableSlotsForDate(date: Date | DateValue): SlotOption[] {
    const bookedSlots = getBookedSlotsForDate(date)

    // If "all-day" is booked, no slots available
    if (bookedSlots.includes('all-day')) {
      return []
    }

    // If ANY slot is booked, "all-day" is not available
    const hasAnyBooking = bookedSlots.length > 0

    return allSlots.value.filter(slot => {
      // Remove already booked slots
      if (bookedSlots.includes(slot.id)) return false

      // Remove "all-day" if any slot is booked
      if (slot.id === 'all-day' && hasAnyBooking) return false

      return true
    })
  }

  // Helper to normalize date to YYYY-MM-DD string
  function normalizeToDateKey(date: Date | DateValue): string {
    if (date instanceof Date) {
      const isoString = date.toISOString()
      return isoString.substring(0, 10) // YYYY-MM-DD
    }
    // DateValue from @internationalized/date
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  }

  // Clear availability data when location changes
  watch(locationId, () => {
    availabilityData.value = {}
  })

  return {
    loading,
    availabilityData,
    allSlots,
    fetchAvailability,
    getBookedSlotsForDate,
    getBookedSlotLabelsForDate,
    hasBookingsOnDate,
    isDateFullyBooked,
    getAvailableSlotsForDate,
    ALL_DAY_SLOT
  }
}
