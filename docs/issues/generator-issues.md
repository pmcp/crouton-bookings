# Nuxt-Crouton Generator Issues

Issues discovered while testing `nuxt-crouton-collection-generator` v1.4.3 with crouton-bookings project.

**Test Date**: 2025-12-08
**Test Project**: crouton-bookings (SuperSaaS base)
**Collections Generated**: 5 (bookings, locations, assets, pages, emailTemplates)

---

## Issue 1: `#crouton/team-auth` Module Alias Not Resolving for TypeScript

**Severity**: High
**Category**: Generator / Type Definitions
**Occurrences**: 20 files

**Error**:
```
Cannot find module '#crouton/team-auth' or its corresponding type declarations.
```

**Affected Files**: All generated API endpoints in `server/api/teams/[id]/*/`

**Root Cause**:
The Nitro alias `#crouton/team-auth` is defined in nuxt-crouton's `nuxt.config.ts`:
```typescript
nitro: {
  alias: {
    '#crouton/team-auth': join(currentDir, 'server/utils/team-auth')
  }
}
```

This works at runtime but TypeScript doesn't resolve Nitro aliases during type-checking.

**Suggested Fix**:
1. Add a `.d.ts` declaration file for the alias in nuxt-crouton
2. Or generate imports using relative paths instead of aliases
3. Or add TypeScript path mappings to the generated layer's tsconfig

---

## Issue 2: Composables Not Auto-Importing in Generated Components

**Severity**: High
**Category**: Generator
**Occurrences**: 10 files

**Error**:
```
Cannot find name 'useBookingsAssets'.
Cannot find name 'useBookingsBookings'.
Cannot find name 'useBookingsLocations'.
// etc.
```

**Affected Files**: All generated `Form.vue` and `List.vue` components

**Root Cause**:
The generated composables are in `layers/bookings/collections/*/app/composables/` but Nuxt's auto-import isn't finding them.

**Suggested Fix**:
1. Add explicit imports in generated components
2. Or configure the layer's nuxt.config.ts to include composables directory
3. Or use `#imports` to ensure auto-imports work

---

## Issue 3: Drizzle Query Type Mismatches

**Severity**: Medium
**Category**: Generator
**Occurrences**: ~15 errors

**Error Examples**:
```
Argument of type '{ ownerUser: { ... }; ... }' is not assignable to parameter of type 'SelectedFields'.
No overload matches this call.
```

**Affected Files**: All generated `server/database/queries.ts` files

**Root Cause**:
The generated query code uses complex joins with owner/relation data that don't match Drizzle's expected types.

**Suggested Fix**:
Review and fix the query generator templates for proper Drizzle typing.

---

## Issue 4: Date Type Mismatch in Form Components

**Severity**: Low
**Category**: Generator
**Occurrences**: 4 files

**Error**:
```
Type 'string' is not assignable to type 'Date'.
```

**Affected Files**: Form.vue components with date fields

**Root Cause**:
Initial values for date fields are set as strings but typed as Date.

**Suggested Fix**:
Use `new Date()` or `null` for date field defaults instead of empty strings.

---

## Issue 5: Missing Maps Package Auto-Detection

**Severity**: Low
**Category**: Generator / Documentation
**Impact**: Manual step required

**Issue**:
When `useMaps: true` is set in config, the generator uses `useGeocode` and `useMarkerColor` composables but doesn't automatically install/configure `@friendlyinternet/nuxt-crouton-maps`.

**Current Behavior**:
- Generator produces code that uses map composables
- User must manually install and add maps package to extends

**Suggested Fix**:
1. Auto-detect `useMaps: true` and install/configure maps package
2. Or document this requirement clearly in CLI output
3. Or add maps to the dependency detection system like the connector

---

## Issue 6: Duplicate `extends` Entry

**Severity**: Low
**Category**: Generator
**Impact**: Cosmetic

**Issue**:
Generator added duplicate `@friendlyinternet/nuxt-crouton` entry to `nuxt.config.ts` extends array.

**Suggested Fix**:
Check for existing entries before adding to extends array.

---

## Summary

| Issue | Severity | Type | GitHub Issue |
|-------|----------|------|--------------|
| #crouton/team-auth not resolving | High | Type Definitions | TBD |
| Composables not auto-importing | High | Generator | TBD |
| Drizzle query type mismatches | Medium | Generator | TBD |
| Date type mismatch | Low | Generator | TBD |
| Maps package not auto-detected | Low | Generator/Docs | TBD |
| Duplicate extends entry | Low | Generator | TBD |

---

## Notes

Despite the TypeScript errors, the generated code may work at runtime since:
- Nitro aliases resolve at runtime
- Auto-imports work at runtime even if TypeScript doesn't see them

Testing at runtime is the next step to verify functionality.
