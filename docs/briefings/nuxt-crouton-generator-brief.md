# nuxt-crouton-collection-generator Brief: OptionsSelect Support

## Overview

Add support for generating `CroutonFormOptionsSelect` components when schema fields use the new `displayAs: "optionsSelect"` meta property.

## New Schema Meta Properties

### Field Schema

```json
{
  "status": {
    "type": "string",
    "meta": {
      "label": "Status",
      "optionsCollection": "bookingsSettings",
      "optionsField": "statuses",
      "displayAs": "optionsSelect",
      "creatable": true
    }
  }
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `optionsCollection` | string | Yes | Collection containing options |
| `optionsField` | string | Yes | Field name holding options array |
| `displayAs` | `"optionsSelect"` | Yes | Triggers OptionsSelect generation |
| `creatable` | boolean | No | Allow inline creation (default: true) |

## Generator Changes

### 1. Schema Parsing

In schema parser, detect `displayAs: "optionsSelect"` and extract:

```javascript
// schema-parser.js
function parseFieldMeta(field) {
  if (field.meta?.displayAs === 'optionsSelect') {
    return {
      type: 'optionsSelect',
      optionsCollection: field.meta.optionsCollection,
      optionsField: field.meta.optionsField,
      creatable: field.meta.creatable ?? true,
      label: field.meta.label
    }
  }
  // ... existing parsing
}
```

### 2. Form Component Generation

When generating Form.vue, output `CroutonFormOptionsSelect` for optionsSelect fields:

```javascript
// form-generator.js
function generateFieldComponent(field, fieldName) {
  if (field.displayAs === 'optionsSelect') {
    return `
        <UFormField label="${field.label}" name="${fieldName}" class="not-last:pb-4">
          <CroutonFormOptionsSelect
            v-model="state.${fieldName}"
            options-collection="${field.optionsCollection}"
            options-field="${field.optionsField}"
            label="${field.label}"
            ${field.creatable ? '' : ':creatable="false"'}
          />
        </UFormField>`
  }
  // ... existing generation
}
```

### 3. Template Output

**Before (current - plain input):**
```vue
<UFormField label="Status" name="status" class="not-last:pb-4">
  <UInput v-model="state.status" class="w-full" size="xl" />
</UFormField>
```

**After (with optionsSelect):**
```vue
<UFormField label="Status" name="status" class="not-last:pb-4">
  <CroutonFormOptionsSelect
    v-model="state.status"
    options-collection="bookingsSettings"
    options-field="statuses"
    label="Status"
  />
</UFormField>
```

## Validation

Add schema validation for optionsSelect fields:

```javascript
function validateOptionsSelectField(field, fieldName) {
  const errors = []

  if (field.meta?.displayAs === 'optionsSelect') {
    if (!field.meta.optionsCollection) {
      errors.push(`Field "${fieldName}": optionsSelect requires optionsCollection`)
    }
    if (!field.meta.optionsField) {
      errors.push(`Field "${fieldName}": optionsSelect requires optionsField`)
    }
  }

  return errors
}
```

## CLI Documentation Fix

### Issue Found

Current docs show config flag incorrectly:
```bash
# WRONG - doesn't work
crouton-generate --config ./crouton.config.mjs
```

### Correct Usage

```bash
# CORRECT - config is a subcommand, not a flag
crouton-generate config ./crouton.config.mjs
```

### Recommended Doc Changes

Add prominent "Quick Start" section at top of CLI docs:

```markdown
## Quick Start

### Config-based generation (recommended)
```bash
crouton-generate config ./crouton.config.mjs
```

### Single collection generation
```bash
crouton-generate <layer> <collection> --fields-file=./schema.json
```
```

## Example: Full Schema

### booking-schema.json
```json
{
  "location": {
    "type": "string",
    "refTarget": "locations",
    "meta": {
      "required": true,
      "label": "Location"
    }
  },
  "date": {
    "type": "date",
    "meta": {
      "required": true,
      "label": "Booking Date"
    }
  },
  "status": {
    "type": "string",
    "meta": {
      "required": true,
      "label": "Status",
      "optionsCollection": "bookingsSettings",
      "optionsField": "statuses",
      "displayAs": "optionsSelect",
      "creatable": true
    }
  },
  "group": {
    "type": "string",
    "meta": {
      "label": "Age Group",
      "optionsCollection": "bookingsSettings",
      "optionsField": "groups",
      "displayAs": "optionsSelect",
      "creatable": true
    }
  }
}
```

### settings-schema.json (options source)
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

## Testing the Generator

```bash
# 1. Create test schemas
echo '{"status":{"type":"string","meta":{"displayAs":"optionsSelect","optionsCollection":"settings","optionsField":"statuses","label":"Status"}}}' > test-schema.json

# 2. Run generator (dry-run first)
crouton-generate test items --fields-file=./test-schema.json --dry-run

# 3. Verify Form.vue contains CroutonFormOptionsSelect
grep -A5 "CroutonFormOptionsSelect" layers/test/collections/items/app/components/Form.vue
```

## Implementation Checklist

- [ ] Add `displayAs: "optionsSelect"` detection in schema parser
- [ ] Add `optionsCollection`/`optionsField` extraction
- [ ] Add validation for required meta properties
- [ ] Update form-generator to output `CroutonFormOptionsSelect`
- [ ] Add tests for optionsSelect field generation
- [ ] Update CLI docs with quick-start section
- [ ] Document new meta properties in schema-format docs

## Dependencies

Requires `CroutonFormOptionsSelect` component to be added to nuxt-crouton package first (see nuxt-crouton-package-brief.md).

## Future: Auto-generate Settings Collection

Optional enhancement: When generator detects `optionsCollection` usage, it could:

1. Check if settings collection exists in config
2. If not, prompt to create it
3. Auto-add repeater field for the optionsField

```javascript
// Pseudo-code
if (usesOptionsSelect && !collectionExists(optionsCollection)) {
  console.log(`Collection "${optionsCollection}" not found.`)
  const create = await prompt(`Create settings collection? (y/n)`)
  if (create) {
    addToConfig(optionsCollection, generateSettingsSchema(optionsFields))
  }
}
```
