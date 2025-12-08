import { useLocalStorage } from '@vueuse/core'
import type { LocationData, SlotItem } from '../types/booking'

export interface CartItem {
  id: string
  locationId: string
  locationTitle: string
  date: string // ISO string for localStorage
  slotId: string
  slotLabel: string
}

export function useBookingCart() {
  const route = useRoute()
  const toast = useToast()

  // Team ID from route
  const teamId = computed(() => route.params.team as string)

  // Cart persisted in localStorage
  const cart = useLocalStorage<CartItem[]>('booking-cart', [])

  // Sidebar open state (for mobile)
  const isOpen = useState('bookingSidebar', () => false)

  // Active tab: 'book' or 'cart'
  const activeTab = useState('bookingSidebarTab', () => 'book')

  // Submitting state
  const isSubmitting = ref(false)

  // Form state (not persisted - reset after adding to cart)
  const formState = reactive({
    locationId: null as string | null,
    date: null as Date | null,
    slotId: null as string | null,
  })

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

  // Parse slots from selected location
  const availableSlots = computed<SlotItem[]>(() => {
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

  // Can add to cart
  const canAddToCart = computed(() =>
    !!formState.locationId && !!formState.date && !!formState.slotId,
  )

  // Cart count for badge
  const cartCount = computed(() => cart.value.length)

  // Generate unique ID
  function generateId() {
    return Math.random().toString(36).substring(2, 9)
  }

  // Get slot label by ID
  function getSlotLabel(slotId: string): string {
    const slot = availableSlots.value.find(s => s.id === slotId)
    return slot?.label || slot?.value || slotId
  }

  // Add current selection to cart
  function addToCart() {
    if (!canAddToCart.value || !selectedLocation.value || !formState.date || !formState.slotId) {
      return
    }

    const item: CartItem = {
      id: generateId(),
      locationId: formState.locationId!,
      locationTitle: selectedLocation.value.title,
      date: formState.date.toISOString(),
      slotId: formState.slotId,
      slotLabel: getSlotLabel(formState.slotId),
    }

    cart.value.push(item)

    // Reset form for next booking
    formState.slotId = null

    toast.add({
      title: 'Added to cart',
      description: `${item.locationTitle} - ${item.slotLabel}`,
      color: 'success',
    })

    // Switch to cart tab to show the added item
    activeTab.value = 'cart'
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

      toast.add({
        title: 'Bookings confirmed!',
        description: `Successfully created ${result.count} booking${result.count === 1 ? '' : 's'}`,
        color: 'success',
      })

      // Switch back to book tab
      activeTab.value = 'book'

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
  }

  return {
    // State
    cart,
    isOpen,
    activeTab,
    formState,
    isSubmitting,

    // Locations
    locations,
    locationsStatus,
    selectedLocation,
    availableSlots,

    // Computed
    canAddToCart,
    cartCount,
    teamId,

    // Actions
    addToCart,
    removeFromCart,
    clearCart,
    submitAll,
    resetForm,
  }
}
