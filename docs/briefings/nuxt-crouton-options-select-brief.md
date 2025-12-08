# nuxt-crouton Feature Brief: Admin-Configurable Options Select

## Related Documents

- **[nuxt-crouton-package-brief.md](./nuxt-crouton-package-brief.md)** - Component implementation details
- **[nuxt-crouton-generator-brief.md](./nuxt-crouton-generator-brief.md)** - Generator changes

## Summary

This document describes a new feature pattern for nuxt-crouton: **OptionsSelect** - a field type that presents a dropdown selector where the options are admin-configurable via a settings collection, with inline creation support.

## Problem Statement

Current nuxt-crouton limitations:
1. **Hardcoded enums** - Options must be defined in the schema, can't be changed by admins
2. **No inline creation** - Users must navigate away to add new options
3. **Team-scoped options** - Each team needs different option lists (statuses, categories, etc.)

**Use cases:**
- Booking statuses: pending, confirmed, cancelled (admin-defined)
- Age groups: Year 6, Year 7, Year 8 (school-specific)
- Product categories: varying by business type
- Any field where options should be managed by end-users, not developers

## Solution: OptionsSelect Pattern

### Architecture Overview

```
┌─────────────────────┐
│  Settings Schema    │  ← Admin-managed options stored here
│  - statuses[]       │
│  - groups[]         │
└─────────────────────┘
          ↑
          │ fetched by
          ↓
┌─────────────────────┐
│ CroutonFormOptions  │  ← New component
│ Select              │
│  - reads options    │
│  - inline creation  │
└─────────────────────┘
          ↑
          │ used by
          ↓
┌─────────────────────┐
│   Booking Form      │  ← Consumer form
│   - status field    │
│   - group field     │
└─────────────────────┘
```

### Schema Meta Properties (New)

```json
{
  "status": {
    "type": "string",
    "meta": {
      "optionsCollection": "bookingsSettings",
      "optionsField": "statuses",
      "displayAs": "optionsSelect",
      "creatable": true
    }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `optionsCollection` | string | Collection containing the options array |
| `optionsField` | string | Field name within the collection that holds options |
| `displayAs` | `"optionsSelect"` | Triggers OptionsSelect component generation |
| `creatable` | boolean | Allow inline creation of new options |
| `multiple` | boolean | (future) Allow multiple selections |

### Settings Schema Pattern

Settings collection stores options as repeater fields:

```json
{
  "statuses": {
    "type": "repeater",
    "meta": {
      "label": "Booking Statuses",
      "repeaterComponent": "OptionItem",
      "addLabel": "Add Status"
    }
  },
  "groups": {
    "type": "repeater",
    "meta": {
      "label": "Age Groups",
      "repeaterComponent": "OptionItem",
      "addLabel": "Add Group"
    }
  }
}
```

Each option item has this structure:
```typescript
interface OptionItem {
  id: string    // Unique identifier
  value: string // Stored value (e.g., "pending")
  label: string // Display text (e.g., "Pending")
}
```

## Component Implementation

### CroutonFormOptionsSelect.vue

**Location:** `app/components/CroutonFormOptionsSelect.vue`

**Props:**
```typescript
interface Props {
  modelValue: string | null | undefined
  optionsCollection: string  // e.g., "bookingsSettings"
  optionsField: string       // e.g., "statuses"
  label: string
  creatable?: boolean        // default: true
  placeholder?: string
}
```

**Features:**
1. Fetches options from settings collection via `useCollectionQuery`
2. Displays as `USelectMenu` with search
3. "Create new" button in dropdown (when `creatable: true`)
4. Modal for creating new options with:
   - Label field (required)
   - Value field (auto-generated from label if empty)
5. Auto-selects newly created option
6. Updates settings collection via `useCollectionMutation`

**Key Implementation Details:**
```typescript
// Fetch settings and extract options from specific field
const { items, pending, error, refresh } = await useCollectionQuery(props.optionsCollection)

const options = computed(() => {
  const settingsRecord = items.value?.[0]
  if (!settingsRecord) return []
  return settingsRecord[props.optionsField] || []
})

// Create new option - updates the settings record
const createOption = async () => {
  const settingsRecord = items.value?.[0]
  const currentOptions = settingsRecord[props.optionsField] || []
  const updatedOptions = [...currentOptions, newOption]

  const { update } = useCollectionMutation(props.optionsCollection)
  await update(settingsRecord.id, {
    [props.optionsField]: updatedOptions
  })
}
```

## Generator Requirements

To add this feature to nuxt-crouton-collection-generator:

### 1. Schema Parsing
Detect `displayAs: "optionsSelect"` in field meta and extract:
- `optionsCollection`
- `optionsField`
- `creatable`

### 2. Form Component Generation
When `displayAs: "optionsSelect"`:
```vue
<CroutonFormOptionsSelect
  v-model="state.{fieldName}"
  options-collection="{optionsCollection}"
  options-field="{optionsField}"
  label="{label}"
  :creatable="{creatable}"
/>
```

### 3. Component Template
Include `CroutonFormOptionsSelect.vue` in the nuxt-crouton package (similar to `CroutonFormReferenceSelect`).

### 4. Settings Collection Auto-Generation (Optional)
When detecting `optionsCollection` usage, optionally:
- Generate the settings schema if it doesn't exist
- Add to crouton config
- Generate the collection

## CLI Documentation Issues Found

During this prototype, several CLI usability issues were discovered:

1. **Command name confusion**: Users try `pnpm crouton`, `npx nuxt-crouton` etc. The actual command is `crouton-generate`

2. **Config syntax misleading**: Docs show `--config` flag but actual syntax is:
   ```bash
   crouton-generate config ./crouton.config.mjs
   ```
   Not:
   ```bash
   crouton-generate --config ./crouton.config.mjs  # Wrong!
   ```

3. **Missing quick-start example**: For config-based projects, the docs should prominently show:
   ```bash
   # Quick start with config file
   crouton-generate config ./crouton.config.mjs
   ```

**Recommended fix:** Add a "Quick Start" section at the top of CLI docs.

## Testing Checklist

- [ ] Create settings collection with statuses and groups repeaters
- [ ] Create first settings record (per team)
- [ ] Add status options: Pending, Confirmed, Cancelled
- [ ] Add group options: Year 6, Year 7, Year 8
- [ ] Create booking with dropdown selectors
- [ ] Test inline creation from booking form
- [ ] Verify new option is auto-selected after creation
- [ ] Test editing existing booking (option pre-selected)

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `schemas/settings-schema.json` | Created | Settings collection schema |
| `crouton.config.mjs` | Modified | Added settings collection |
| `app/components/CroutonFormOptionsSelect.vue` | Created | New component |
| `layers/bookings/collections/settings/` | Generated | Settings collection |
| `layers/bookings/collections/bookings/app/components/Form.vue` | Modified | Use new component |
| `schemas/booking-schema.json` | Modified | Added meta properties |

## Future Enhancements

1. **Multiple selection** - Add `multiple: true` support for multi-select
2. **Color/icon support** - Allow options to have colors (for status badges)
3. **Default values** - Seed default options when team is created
4. **Validation** - Ensure selected value exists in options array
5. **Option ordering** - Drag-and-drop reordering in settings

## Conclusion

The OptionsSelect pattern enables admin-configurable dropdown fields without schema changes. This prototype validates the approach and provides a clear implementation path for adding this feature to nuxt-crouton.

**Next Steps:**
1. Review and test prototype in crouton-bookings
2. Port `CroutonFormOptionsSelect` to nuxt-crouton package
3. Add generator support for `displayAs: "optionsSelect"`
4. Update CLI documentation with quick-start example
5. Document pattern in nuxt-crouton docs
