<template>
  <CroutonFormActionButton
    v-if="action === 'delete'"
    :action="action"
    :collection="collection"
    :items="items"
    :loading="loading"
    @click="handleSubmit"
  />

  <UForm
    v-else
    :schema="schema"
    :state="state"
    @submit="handleSubmit"
    @error="handleValidationError"
  >
    <CroutonFormLayout :tabs="tabs" :navigation-items="navigationItems" :tab-errors="tabErrorCounts" v-model="activeSection">
      <template #main="{ activeSection }">
      <div v-show="!tabs || activeSection === 'basic'" class="flex flex-col gap-4 p-1">
        <UFormField :label="$t('bookings.collections.locations.fields.title')" name="title" class="not-last:pb-4">
          <UInput v-model="state.title" class="w-full" size="xl" />
        </UFormField>
      </div>

      <div v-show="!tabs || activeSection === 'address'" class="flex flex-col gap-4 p-1">
        <UFormField :label="$t('bookings.collections.locations.fields.street')" name="street" class="not-last:pb-4">
          <UInput v-model="state.street" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="$t('bookings.collections.locations.fields.zip')" name="zip" class="not-last:pb-4">
          <UInput v-model="state.zip" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="$t('bookings.collections.locations.fields.city')" name="city" class="not-last:pb-4">
          <UInput v-model="state.city" class="w-full" size="xl" />
        </UFormField>

       <!-- MapBox Map Display -->
      <UFormField :label="$t('bookings.collections.locations.fields.locationMap')" name="location" class="not-last:pb-4">
        <CroutonMapsMap
          :center="mapCenter"
          :zoom="14"
          height="400px"
          class="rounded-lg border"
          :fly-to-on-center-change="true"
          @load="handleMapLoad"
        >
          <template #default="{ map }">
            <CroutonMapsMarker
              v-if="mapCenter[0] !== 0 || mapCenter[1] !== 0"
              :map="map"
              :position="mapCenter"
              :color="markerColor"
              :options="{ draggable: true }"
              :animate-transitions="true"
              @dragEnd="handleMarkerDragEnd"
            />
          </template>
        </CroutonMapsMap>
        <p v-if="geocoding" class="text-sm text-gray-500 mt-2">
          {{ $t('bookings.collections.locations.geocoding') }}
        </p>
      </UFormField>
      </div>

      <div v-show="!tabs || activeSection === 'content'" class="flex flex-col gap-4 p-1">
        <UFormField :label="$t('bookings.collections.locations.fields.content')" name="content" class="not-last:pb-4">
          <CroutonEditorSimple v-model="state.content" />
        </UFormField>
      </div>

      <div v-show="!tabs || activeSection === 'scheduling'" class="flex flex-col gap-4 p-1">
        <UFormField :label="$t('bookings.collections.locations.fields.slots')" name="slots" class="not-last:pb-4">
          <CroutonFormRepeater
            v-model="state.slots"
            component-name="BookingsLocationsSlotInput"
            :add-label="$t('bookings.collections.locations.fields.addTimeSlot')"
            :sortable="true"
          />
        </UFormField>
      </div>
      </template>

      <template #sidebar>
      <div class="flex flex-col gap-4 p-1">
        <UFormField :label="$t('bookings.collections.locations.fields.allowedMemberIds')" name="allowedMemberIds" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.allowedMemberIds"
            collection="teamMembers"
            :label="$t('bookings.collections.locations.fields.allowedMemberIds')"
            multiple
          />
        </UFormField>
      </div>
      </template>

      <template #footer>
        <CroutonValidationErrorSummary
          v-if="validationErrors.length > 0"
          :tab-errors="tabErrorCounts"
          :navigation-items="navigationItems"
          @switch-tab="switchToTab"
        />

        <CroutonFormActionButton
          :action="action"
          :collection="collection"
          :items="items"
          :loading="loading"
          :has-validation-errors="validationErrors.length > 0"
        />
      </template>
    </CroutonFormLayout>
  </UForm>
</template>

<script setup lang="ts">
import type { BookingsLocationFormProps, BookingsLocationFormData } from '../../types'

const props = defineProps<BookingsLocationFormProps>()
const { defaultValue, schema, collection } = useBookingsLocations()

const { t } = useI18n()

// Form layout configuration
const navigationItems = computed(() => [
  { label: t('bookings.collections.locations.tabs.basic'), value: 'basic' },
  { label: t('bookings.collections.locations.tabs.address'), value: 'address' },
  { label: t('bookings.collections.locations.tabs.content'), value: 'content' },
  { label: t('bookings.collections.locations.tabs.scheduling'), value: 'scheduling' }
])

const tabs = ref(true)
const activeSection = ref('basic')

// Map field names to their tab groups for error tracking
const fieldToGroup: Record<string, string> = {
  'title': 'basic',
  'street': 'address',
  'zip': 'address',
  'city': 'address',
  'content': 'content',
  'slots': 'scheduling'
}

// Track validation errors for tab indicators
const validationErrors = ref<Array<{ name: string; message: string }>>([])

// Handle form validation errors
const handleValidationError = (event: any) => {
  if (event?.errors) {
    validationErrors.value = event.errors
  }
}

// Compute errors per tab
const tabErrorCounts = computed(() => {
  const counts: Record<string, number> = {}

  validationErrors.value.forEach(error => {
    const tabName = fieldToGroup[error.name] || 'general'
    counts[tabName] = (counts[tabName] || 0) + 1
  })

  return counts
})

// Switch to a specific tab (for clicking error links)
const switchToTab = (tabValue: string) => {
  activeSection.value = tabValue
}

// Use new mutation composable for data operations
const { create, update, deleteItems } = useCollectionMutation(collection)

// useCrouton still manages modal state
const { close } = useCrouton()

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<BookingsLocationFormData & { id?: string | null }>(initialValues)

// Map & Geocoding functionality
const { geocode, loading: geocoding } = useGeocode()

// Parse existing coordinates from location field (handle both array and string formats)
const parseCoordinates = (value: any): [number, number] | null => {
  if (!value) return null
  if (Array.isArray(value) && value.length === 2) {
    return [Number(value[0]), Number(value[1])]
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.length === 2) {
        return [Number(parsed[0]), Number(parsed[1])]
      }
    } catch {
      return null
    }
  }
  return null
}

const initialCoordinates = parseCoordinates(state.value.location)
const mapCenter = ref<[number, number]>(initialCoordinates || [0, 0])
const mapInstance = ref<any>(null)

const markerColor = useMarkerColor()

// Store map instance when loaded
const handleMapLoad = (map: any) => {
  mapInstance.value = map
}

// Auto-geocode when address fields change
watchDebounced(
  () => [state.value.street, state.value.zip, state.value.city],
  async () => {
    if (canGeocode.value) {
      await handleGeocode()
    }
  },
  { debounce: 1000, maxWait: 3000 }
)

// Check if we have enough address data to geocode
const canGeocode = computed(() => {
  return !!state.value.street || !!state.value.zip
})

// Handle geocoding of address fields
const handleGeocode = async () => {
  try {
    // Build address query from all address fields
    const addressParts: string[] = []
    if (state.value.street) addressParts.push(state.value.street as string)
    if (state.value.zip) addressParts.push(state.value.zip as string)
    if (state.value.city) addressParts.push(state.value.city as string)

    const addressQuery = addressParts.join(', ')
    if (!addressQuery.trim()) return

    const result = await geocode(addressQuery)
    if (result) {
      mapCenter.value = result.coordinates

      // Update the coordinate field in the form state (store as JSON string)
      state.value.location = JSON.stringify(result.coordinates)
    }
  } catch (error) {
    console.error('Geocoding failed:', error)
  }
}

// Handle marker drag to update coordinates
const handleMarkerDragEnd = (event: any) => {
  const lngLat = event.target.getLngLat()
  mapCenter.value = [lngLat.lng, lngLat.lat]
  state.value.location = JSON.stringify([lngLat.lng, lngLat.lat])
}

const handleSubmit = async () => {
  try {
    if (props.action === 'create') {
      await create(state.value)
    } else if (props.action === 'update' && state.value.id) {
      await update(state.value.id, state.value)
    } else if (props.action === 'delete') {
      await deleteItems(props.items)
    }

    // Clear validation errors on successful submission
    validationErrors.value = []

    close()

  } catch (error) {
    console.error('Form submission failed:', error)
    // You can add toast notification here if available
    // toast.add({ title: 'Error', description: 'Failed to submit form', color: 'red' })
  }
}
</script>