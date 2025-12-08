# Nuxt-Crouton-Maps Issues

Tracking issues and bugs found in the `@friendlyinternet/nuxt-crouton-maps` package.

## Open Issues

### 1. CroutonMapsMarker dragEnd event emits no payload
**Priority**: High
**Category**: Bug / API Design

**Symptom**: When using a draggable marker and listening to the `@dragEnd` event, the handler receives no event data, causing errors when trying to get the new position.

**Error Message**:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'target')
    at handleMarkerDragEnd (Form.vue:258:24)
```

**Code that fails**:
```vue
<CroutonMapsMarker
  :map="map"
  :position="mapCenter"
  :options="{ draggable: true }"
  @dragEnd="handleMarkerDragEnd"
/>
```

```typescript
// This fails because event is undefined
const handleMarkerDragEnd = (event: any) => {
  const lngLat = event.target.getLngLat()  // ERROR: Cannot read 'target' of undefined
  mapCenter.value = [lngLat.lng, lngLat.lat]
}
```

**Root Cause** (in `node_modules/@friendlyinternet/nuxt-crouton-maps/app/components/Marker.vue`):

```typescript
// Lines 25-30: Event defined with no payload
const emit = defineEmits<{
  click: []
  dragStart: []
  drag: []
  dragEnd: []  // Empty tuple = no data passed
}>()

// Line 85: Original Mapbox event is discarded
marker.value.on('dragend', () => emit('dragEnd'))  // No data passed!
```

The component listens to Mapbox's `dragend` event but discards the event object when emitting to Vue.

**Expected Behavior**: The `dragEnd` event should emit position data or the original Mapbox marker event:

```typescript
// Option A: Emit position directly
marker.value.on('dragend', () => {
  const lngLat = marker.value.getLngLat()
  emit('dragEnd', { lng: lngLat.lng, lat: lngLat.lat })
})

// Option B: Emit the marker reference
marker.value.on('dragend', () => {
  emit('dragEnd', marker.value)
})
```

---

## Workarounds

### Option 1: Disable dragging (Simplest)
If you don't need drag-to-update functionality, just disable dragging:

```vue
<CroutonMapsMarker
  :map="map"
  :position="mapCenter"
  :options="{ draggable: false }"
/>
```

### Option 2: Use a ref to access marker position
Access the marker directly via ref instead of relying on the event:

```vue
<CroutonMapsMarker
  ref="markerRef"
  :map="map"
  :position="mapCenter"
  :options="{ draggable: true }"
  @dragEnd="handleMarkerDragEnd"
/>
```

```typescript
const markerRef = ref()

const handleMarkerDragEnd = () => {
  // Access marker through ref instead of event
  const marker = markerRef.value?.marker
  if (marker) {
    const lngLat = marker.getLngLat()
    mapCenter.value = [lngLat.lng, lngLat.lat]
  }
}
```

### Option 3: Use the `drag` event with debounce
Listen to the `drag` event (which fires continuously) with debouncing:

```typescript
import { useDebounceFn } from '@vueuse/core'

const handleDrag = useDebounceFn(() => {
  // Update position from marker ref
}, 300)
```

---

## Recommended Fix for Package

The package should update `Marker.vue` to emit position data:

```typescript
// Current (broken):
marker.value.on('dragend', () => emit('dragEnd'))

// Fixed:
marker.value.on('dragend', () => {
  const lngLat = marker.value.getLngLat()
  emit('dragEnd', { lng: lngLat.lng, lat: lngLat.lat })
})
```

And update the type definition:
```typescript
const emit = defineEmits<{
  click: []
  dragStart: []
  drag: []
  dragEnd: [position: { lng: number; lat: number }]  // Add payload type
}>()
```

---

## Resolved Issues

*None yet*

---

## Notes

- Package: `@friendlyinternet/nuxt-crouton-maps`
- Issue discovered: 2024-12-08
- Context: Using map component in bookings locations form
