# Nuxt-Crouton Documentation Issues

Tracking documentation gaps and improvement suggestions for the nuxt-crouton package.

## Open Issues

### 1. Missing: CroutonForm setup instruction
**Priority**: High
**Section**: Installation / Quick Start

The docs should clearly state that `<CroutonForm />` must be added to `app.vue`:

```vue
<template>
  <UApp>
    <NuxtPage />
    <CroutonForm />  <!-- Required for inline editing -->
  </UApp>
</template>
```

Without this, the inline form editing functionality won't work.

---

### 2. Missing: Nuxt 4 and Nuxt UI 4 requirement
**Priority**: Critical
**Section**: Installation / Requirements

The docs must clearly state that nuxt-crouton requires:
- **Nuxt 4** (`nuxt: ^4.0.0`)
- **Nuxt UI 4** (`@nuxt/ui: ^4.0.0`)

This is already in `peerDependencies` but should be prominently displayed in the installation docs.

```json
{
  "dependencies": {
    "nuxt": "^4.0.0",
    "@nuxt/ui": "^4.0.0"
  }
}
```

---

### 3. Layer pages not resolving (404) with Nuxt 3
**Priority**: High
**Category**: Documentation / Compatibility

**Symptom**: `/dashboard/[team]/crouton` returns 404 when using Nuxt 3 with nuxt-crouton.

**Root Cause**: nuxt-crouton uses `app/pages/` directory (Nuxt 4 convention). When the consuming app uses Nuxt 3, Nuxt looks for `pages/` instead of `app/pages/`.

**Solution**: Upgrade to Nuxt 4 in the consuming app:
```json
{
  "dependencies": {
    "nuxt": "^4.0.0"
  }
}
```

**Status**: ✅ RESOLVED by upgrading to Nuxt 4

**Documentation Action**: Clearly state Nuxt 4 is required (see Issue #2)

---

### ~~4. Nested route layout requirement~~ (WITHDRAWN)
**Status**: Withdrawn - This was a misunderstanding

~~When using the built-in crouton pages, developers must create an intermediate layout file.~~

**Correction**: Nuxt's nested routing handles `crouton/index.vue` as a child of `[team].vue` directly. No intermediate `crouton.vue` wrapper is needed. Verified by comparing with EchafTest which works without it.

---

### 4. Generator should auto-install dependencies based on field types
**Priority**: Medium
**Category**: Generator Enhancement

**Problem**: When a collection schema uses field types that require additional packages (e.g., `editor` type requires `nuxt-crouton-editor`, `map` type requires `nuxt-crouton-maps`), the generator does not automatically install these dependencies.

**Example**: `bookingsBookings` has a `content` field using the editor type, but `nuxt-crouton-editor` was not installed.

**Expected Behavior**: The generator should:
1. Detect field types that require additional packages
2. Either auto-install them or warn the user to install them

**Field → Package mapping**:
- `editor` → `@friendlyinternet/nuxt-crouton-editor`
- `map` / `location` → `@friendlyinternet/nuxt-crouton-maps`
- `i18n` / `translation` → `@friendlyinternet/nuxt-crouton-i18n`

---

## Resolved Issues

*None yet*

---

## Notes

- Package repo: https://github.com/friendlyinternet/nuxt-crouton (or wherever it's hosted)
- These issues discovered during crouton-bookings setup on 2024-12-08