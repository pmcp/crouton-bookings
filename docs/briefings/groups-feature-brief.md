# Briefing: Groups Feature Implementation

## Summary

Implemented conditional "Groups" field for bookings (e.g., age groups). When enabled in settings, customers must select a group when booking.

## What Was Done

### 1. Settings Schema & Toggle
- Added `enableGroups` boolean to `bookingsSettings` schema
- Added toggle in Booking Options settings form (`/dashboard/[team]/crouton/bookingsSettings`)
- Groups repeater only shows when toggle is ON
- Migration generated: `0006_elite_the_spike.sql`

**Files modified:**
- `layers/bookings/collections/settings/app/composables/useBookingsSettings.ts`
- `layers/bookings/collections/settings/server/database/schema.ts`
- `layers/bookings/collections/settings/types.ts`
- `layers/bookings/collections/settings/app/components/Form.vue`
- `layers/bookings/collections/settings/server/api/teams/[id]/bookings-settings/[settingId].patch.ts`

### 2. Customer Booking Form
- Added group selection (radio buttons) after time slot selection
- Group field only appears when `enableGroups` is true AND a slot is selected
- `canAddToCart` requires group selection when enabled

**Files modified:**
- `layers/customer-booking/app/composables/useBookingCart.ts`
- `layers/customer-booking/app/components/BookingSidebar/Form.vue`

### 3. Saving Group to Database
- Batch endpoint now saves `groupId` when creating bookings

**Files modified:**
- `layers/customer-booking/server/api/teams/[id]/customer-bookings-batch.post.ts`

### 4. Displaying Group
Group now displays in:
- **Cart items** - `Sat, Jan 10 · age1`
- **MyBookings sidebar** - `Wed, Dec 31 at slot1 · age1`
- **MyBookings/List.vue** (full page) - same format
- **Admin bookings list** - Group column with CroutonOptionsFieldCardMini

**Files modified:**
- `layers/customer-booking/app/components/BookingSidebar/Cart.vue`
- `layers/customer-booking/app/components/BookingSidebar/MyBookings.vue`
- `layers/customer-booking/app/components/MyBookings/List.vue`
- `layers/bookings/collections/bookings/app/components/List.vue`

### 5. Sidebar Navigation
- Added "Booking Options" link to settings section in sidebar

**Files modified:**
- `app/components/App/Sidebar/Team.vue`

## Data Flow

```
Settings (bookingsSettings)
├── enableGroups: boolean
└── groups: Array<{ id, label, value?, color? }>

Booking Form
├── Fetches settings via useBookingCart() → settingsData
├── Shows group selection when enableGroups && slotId selected
└── Requires groupId for canAddToCart when enableGroups

Cart Item (localStorage)
├── groupId: string | null
└── groupLabel: string | null

Database (bookings_bookings)
└── group: string (stores groupId)

Display
└── Lookup groupId in settings.groups to get label
```

## Potential Follow-up Tasks

### 1. Shared BookingCard Component
User mentioned wanting a consistent card component for displaying bookings everywhere. Currently duplicated across:
- `BookingSidebar/Cart.vue`
- `BookingSidebar/MyBookings.vue`
- `MyBookings/List.vue`

Could create: `components/BookingCard.vue` with props for booking data and display options.

### 2. Admin Booking Form
The admin booking form (`layers/bookings/collections/bookings/app/components/Form.vue`) already has group field with conditional display based on `enableGroups`. Verify it works correctly.

### 3. Pre-existing Type Errors
There are many pre-existing TypeScript errors unrelated to this feature (User type issues, drizzle version mismatches). These should be addressed separately.

### 4. Translations
The group-related UI text is not yet translated. Add keys like:
- `bookings.form.group`
- `bookings.form.selectGroup`

## Testing Checklist

- [ ] Enable groups in Booking Options
- [ ] Add groups (e.g., "Adults", "Children")
- [ ] Create new booking - verify group selection appears after slot
- [ ] Verify group shows in cart
- [ ] Submit booking - verify group saved
- [ ] Verify group shows in MyBookings sidebar
- [ ] Verify group shows in admin bookings list
- [ ] Disable groups - verify field hidden in booking form

## Recent Commits

```
9d29df5 feat(bookings): display group in MyBookings sidebar and admin list
a30bccc fix(bookings): save group when creating bookings via batch endpoint
987fb49 feat(bookings): display group in cart items
df76c1a feat(bookings): display group in My Bookings list
fd3ee51 feat(bookings): add group selection to customer booking form
0af34e1 fix(bookings): include enableGroups in settings PATCH endpoint
b6f5bf1 feat(bookings): add conditional groups field with enableGroups toggle
```
