import { useLocalStorage } from '@vueuse/core'
import type { LocationData, SlotItem } from '../types/booking'

export interface CartItem {
  id: string
  locationId: string
  locationTitle: string
  date: string // ISO string for localStorage
  slotId: string
  slotLabel: string
  slotColor?: string
  totalSlots?: number
  slotPosition?: number
  groupId?: string | null
  groupLabel?: string | null
}

interface AvailabilityData {
  [dateISO: string]: {
    bookedSlots: string[]
  }
}

const ALL_DAY_SLOT: SlotItem = {
  id: 'all-day',
  label: 'All Day',
}

interface BookingData {
  id: string
  date: string | Date
  status: string
}

export function useBookingCart() {
  const route = useRoute()
  const toast = useToast()

  // Team ID from route - support both 'team' and 'teamSlug' params
  const teamId = computed(() => (route.params.team || route.params.teamSlug) as string)

  // Cart persisted in localStorage
  const cart = useLocalStorage<CartItem[]>('booking-cart', [])

  // Fetch customer bookings for the "My Bookings" count and list
  // Using shared key so both the tab count and MyBookings component share the same data
  const { data: myBookings, status: myBookingsStatus, refresh: refreshMyBookings } = useFetch<BookingData[]>(
    () => `/api/teams/${teamId.value}/customer-bookings`,
    {
      key: 'sidebar-customer-bookings',
    },
  )

  // Count of upcoming bookings (future dates only)
  const upcomingBookingsCount = computed(() => {
    if (!myBookings.value) return 0
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return myBookings.value.filter((b) => {
      const bookingDate = new Date(b.date)
      return bookingDate >= now
    }).length
  })

  // Sidebar open state (for mobile)
  const isOpen = useState('bookingSidebar', () => false)

  // Active tab: 'book' or 'my-bookings'
  const activeTab = useState('bookingSidebarTab', () => 'book')

  // Cart drawer open state (bottom drawer)
  const isCartOpen = useState('bookingCartDrawer', () => false)

  // Expanded state (XL mode with map)
  const isExpanded = useState('bookingSidebarExpanded', () => false)

  // Submitting state
  const isSubmitting = ref(false)

  // Cart pulse animation trigger (increments when item added)
  const cartPulse = useState('bookingCartPulse', () => 0)

  // Fetch booking settings (for enableGroups and groups options)
  const { data: settingsData } = useFetch<Array<{ enableGroups?: boolean, groups?: Array<{ id: string, label: string }> }>>(
    () => `/api/teams/${teamId.value}/bookings-settings`,
    {
      key: 'booking-cart-settings',
    },
  )

  // Settings computed values
  const enableGroups = computed(() => settingsData.value?.[0]?.enableGroups ?? false)
  const groupOptions = computed(() => settingsData.value?.[0]?.groups ?? [])

  // Form state - use useState for shared state across components
  // Note: useState returns a Ref, so we wrap in reactive to maintain existing API
  const formStateRef = useState<{
    locationId: string | null
    date: Date | null
    slotId: string | null
    groupId: string | null
  }>('bookingFormState', () => ({
    locationId: null,
    date: null,
    slotId: null,
    groupId: null,
  }))

  // Create a reactive wrapper to maintain the existing API (formState.locationId instead of formState.value.locationId)
  const formState = reactive({
    get locationId() { return formStateRef.value.locationId },
    set locationId(v: string | null) { formStateRef.value.locationId = v },
    get date() { return formStateRef.value.date },
    set date(v: Date | null) { formStateRef.value.date = v },
    get slotId() { return formStateRef.value.slotId },
    set slotId(v: string | null) { formStateRef.value.slotId = v },
    get groupId() { return formStateRef.value.groupId },
    set groupId(v: string | null) { formStateRef.value.groupId = v },
  })

  // Availability data from API
  const availabilityData = ref<AvailabilityData>({})
  const availabilityLoading = ref(false)

  // Fetch allowed locations
  const { data: locations, status: locationsStatus } = useFetch<LocationData[]>(
    () => `/api/teams/${teamId.value}/customer-locations`,
    {
      key: 'booking-cart-locations',
    },
  )

  // Selected location object
  const selectedLocation = computed(() => {
    if (!formState.locationId || !locations.value) return null
    return locations.value.find(l => l.id === formState.locationId) || null
  })

  // Parse raw slots from selected location (without availability filtering)
  const rawSlots = computed<SlotItem[]>(() => {
    if (!selectedLocation.value?.slots) return []

    const slots = selectedLocation.value.slots
    if (typeof slots === 'string') {
      try {
        const parsed = JSON.parse(slots)
        return Array.isArray(parsed) ? parsed : []
      }
      catch {
        return []
      }
    }

    return Array.isArray(slots) ? slots : []
  })

  // Normalize date to YYYY-MM-DD string
  function normalizeToDateKey(date: Date): string {
    return date.toISOString().substring(0, 10)
  }

  // Check if two dates are the same day
  function isSameDay(date1: Date, date2: Date): boolean {
    return normalizeToDateKey(date1) === normalizeToDateKey(date2)
  }

  // Fetch availability for a date range
  async function fetchAvailability(startDate: Date, endDate: Date) {
    if (!formState.locationId || !teamId.value) return

    availabilityLoading.value = true
    try {
      const data = await $fetch<AvailabilityData>(
        `/api/teams/${teamId.value}/bookings-bookings/availability`,
        {
          query: {
            locationId: formState.locationId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        },
      )
      availabilityData.value = data
    }
    catch (error) {
      console.error('Failed to fetch availability:', error)
      availabilityData.value = {}
    }
    finally {
      availabilityLoading.value = false
    }
  }

  // Get booked slots from API for a specific date
  function getApiBookedSlotsForDate(date: Date): string[] {
    const dateKey = normalizeToDateKey(date)
    return availabilityData.value[dateKey]?.bookedSlots || []
  }

  // Get booked slots from cart for a specific date and location
  function getCartBookedSlotsForDate(date: Date): string[] {
    if (!formState.locationId) return []

    return cart.value
      .filter(item =>
        item.locationId === formState.locationId
        && isSameDay(new Date(item.date), date),
      )
      .map(item => item.slotId)
  }

  // All slots including "All Day" prepended
  const allSlots = computed<SlotItem[]>(() => {
    if (!selectedLocation.value) return []
    return [ALL_DAY_SLOT, ...rawSlots.value]
  })

  // Get booked slot IDs for the selected date (from API + cart)
  const bookedSlotIds = computed<string[]>(() => {
    if (!formState.date) return []

    const apiBooked = getApiBookedSlotsForDate(formState.date)
    const cartBooked = getCartBookedSlotsForDate(formState.date)
    return [...new Set([...apiBooked, ...cartBooked])]
  })

  // Check if a slot is disabled
  function isSlotDisabled(slotId: string): boolean {
    if (!formState.date) return true

    // If "all-day" is booked, all slots are disabled
    if (bookedSlotIds.value.includes('all-day')) {
      return true
    }

    // If this slot is booked, it's disabled
    if (bookedSlotIds.value.includes(slotId)) {
      return true
    }

    // If any slot is booked, "all-day" is disabled
    if (slotId === 'all-day' && bookedSlotIds.value.length > 0) {
      return true
    }

    return false
  }

  // Compute available slots (for backward compatibility - non-disabled slots)
  const availableSlots = computed<SlotItem[]>(() => {
    if (!formState.date || !selectedLocation.value) return []
    return allSlots.value.filter(slot => !isSlotDisabled(slot.id))
  })

  // === Calendar availability helpers ===

  // Get all booked slots for a date (API + cart combined)
  function getBookedSlotsForDate(date: Date): string[] {
    const apiBooked = getApiBookedSlotsForDate(date)
    const cartBooked = getCartBookedSlotsForDate(date)
    return [...new Set([...apiBooked, ...cartBooked])]
  }

  // Check if a date has any bookings
  function hasBookingsOnDate(date: Date): boolean {
    return getBookedSlotsForDate(date).length > 0
  }

  // Check if a date is fully booked
  function isDateFullyBooked(date: Date): boolean {
    const bookedSlots = getBookedSlotsForDate(date)

    // If "all-day" is booked, the date is fully booked
    if (bookedSlots.includes('all-day')) {
      return true
    }

    // If all individual slots are booked, it's fully booked
    const individualSlots = rawSlots.value.map(s => s.id)
    if (individualSlots.length === 0) return false

    return individualSlots.every(slotId => bookedSlots.includes(slotId))
  }

  // Get booked slot labels for tooltip display
  function getBookedSlotLabelsForDate(date: Date): string[] {
    const bookedIds = getBookedSlotsForDate(date)
    return bookedIds.map(id => getSlotLabel(id))
  }

  // Fetch availability when location changes
  watch(() => formState.locationId, () => {
    availabilityData.value = {}
    if (formState.locationId) {
      // Fetch 3 months of availability
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0)
      fetchAvailability(startDate, endDate)
    }
  }, { immediate: true })

  // Can add to cart (require group if enableGroups is true)
  const canAddToCart = computed(() => {
    const baseValid = !!formState.locationId && !!formState.date && !!formState.slotId
    if (!baseValid) return false
    // If groups are enabled, require a group selection
    if (enableGroups.value && !formState.groupId) return false
    return true
  })

  // Cart count for badge
  const cartCount = computed(() => cart.value.length)

  // Generate unique ID
  function generateId() {
    return Math.random().toString(36).substring(2, 9)
  }

  // Get slot label by ID
  function getSlotLabel(slotId: string): string {
    if (slotId === 'all-day') return ALL_DAY_SLOT.label!
    const slot = rawSlots.value.find(s => s.id === slotId)
    return slot?.label || slot?.value || slotId
  }

  // Get group label by ID
  function getGroupLabel(groupId: string | null): string | null {
    if (!groupId) return null
    const group = groupOptions.value.find(g => g.id === groupId)
    return group?.label || groupId
  }

  // Get slot position info by ID
  function getSlotPositionInfo(slotId: string): { color?: string, totalSlots: number, position: number } | null {
    if (slotId === 'all-day') return null
    const slots = rawSlots.value
    if (!slots.length) return null
    const position = slots.findIndex(s => s.id === slotId)
    if (position === -1) return null
    return {
      color: slots[position]?.color,
      totalSlots: slots.length,
      position,
    }
  }

  // Add current selection to cart
  function addToCart() {
    if (!canAddToCart.value || !selectedLocation.value || !formState.date || !formState.slotId) {
      return
    }

    const positionInfo = getSlotPositionInfo(formState.slotId)

    const item: CartItem = {
      id: generateId(),
      locationId: formState.locationId!,
      locationTitle: selectedLocation.value.title,
      date: formState.date.toISOString(),
      slotId: formState.slotId,
      slotLabel: getSlotLabel(formState.slotId),
      slotColor: positionInfo?.color,
      totalSlots: positionInfo?.totalSlots,
      slotPosition: positionInfo?.position,
      groupId: formState.groupId,
      groupLabel: getGroupLabel(formState.groupId),
    }

    cart.value.push(item)

    // Reset form for next booking
    formState.slotId = null
    formState.groupId = null

    // Trigger pulse animation on cart button (don't auto-open)
    cartPulse.value++
  }

  // Remove item from cart
  function removeFromCart(id: string) {
    const index = cart.value.findIndex(item => item.id === id)
    if (index !== -1) {
      cart.value.splice(index, 1)
    }
  }

  // Clear entire cart
  function clearCart() {
    cart.value = []
  }

  // Submit all bookings in cart
  async function submitAll() {
    if (cart.value.length === 0) {
      toast.add({
        title: 'Cart is empty',
        description: 'Add some bookings to your cart first',
        color: 'warning',
      })
      return null
    }

    isSubmitting.value = true

    try {
      const result = await $fetch(`/api/teams/${teamId.value}/customer-bookings-batch`, {
        method: 'POST',
        body: {
          bookings: cart.value,
        },
      })

      // Clear cart on success
      clearCart()

      // Refresh my bookings list to show newly created bookings
      await refreshMyBookings()

      toast.add({
        title: 'Bookings confirmed!',
        description: `Successfully created ${result.count} booking${result.count === 1 ? '' : 's'}`,
        color: 'success',
      })

      // Close cart drawer and switch to my bookings tab
      isCartOpen.value = false
      activeTab.value = 'my-bookings'

      return result
    }
    catch (error: any) {
      console.error('Failed to submit bookings:', error)
      toast.add({
        title: 'Booking failed',
        description: error.data?.message || 'Failed to create bookings. Please try again.',
        color: 'error',
      })
      return null
    }
    finally {
      isSubmitting.value = false
    }
  }

  // Reset form state
  function resetForm() {
    formState.locationId = null
    formState.date = null
    formState.slotId = null
    formState.groupId = null
  }

  // Cancel a booking (set status to 'cancelled')
  async function cancelBooking(bookingId: string) {
    try {
      await $fetch(`/api/teams/${teamId.value}/bookings-bookings/${bookingId}`, {
        method: 'PATCH',
        body: {
          status: 'cancelled',
        },
      })

      // Refresh the bookings list
      await refreshMyBookings()

      toast.add({
        title: 'Booking cancelled',
        description: 'Your booking has been cancelled successfully',
        color: 'success',
      })

      return true
    }
    catch (error: any) {
      console.error('Failed to cancel booking:', error)
      toast.add({
        title: 'Cancellation failed',
        description: error.data?.message || 'Failed to cancel booking. Please try again.',
        color: 'error',
      })
      return false
    }
  }

  // Permanently delete a booking
  async function deleteBooking(bookingId: string) {
    try {
      await $fetch(`/api/teams/${teamId.value}/bookings-bookings/${bookingId}`, {
        method: 'DELETE',
      })

      // Refresh the bookings list
      await refreshMyBookings()

      toast.add({
        title: 'Booking deleted',
        description: 'The booking has been permanently removed',
        color: 'success',
      })

      return true
    }
    catch (error: any) {
      console.error('Failed to delete booking:', error)
      toast.add({
        title: 'Delete failed',
        description: error.data?.message || 'Failed to delete booking. Please try again.',
        color: 'error',
      })
      return false
    }
  }

  return {
    // State
    cart,
    isOpen,
    isCartOpen,
    isExpanded,
    activeTab,
    formState,
    isSubmitting,
    availabilityLoading,
    cartPulse,

    // Settings (groups)
    enableGroups,
    groupOptions,

    // Locations
    locations,
    locationsStatus,
    selectedLocation,
    allSlots,
    availableSlots,
    isSlotDisabled,

    // Calendar availability helpers
    hasBookingsOnDate,
    isDateFullyBooked,
    getBookedSlotLabelsForDate,
    getBookedSlotsForDate,

    // My Bookings (shared data for MyBookings component)
    myBookings,
    myBookingsStatus,
    refreshMyBookings,

    // Computed
    canAddToCart,
    cartCount,
    upcomingBookingsCount,
    teamId,

    // Actions
    addToCart,
    removeFromCart,
    clearCart,
    submitAll,
    resetForm,
    cancelBooking,
    deleteBooking,
  }
}
