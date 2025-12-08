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

### 2. ~~Missing: Nested route layout requirement~~ (INCORRECT)
**Status**: Withdrawn - This was a misunderstanding

~~When using the built-in crouton pages, developers must create an intermediate layout file.~~

**Correction**: Nuxt's nested routing handles `crouton/index.vue` as a child of `[team].vue` directly. No intermediate `crouton.vue` wrapper is needed. Verified by comparing with EchafTest which works without it.

---

## Resolved Issues

*None yet*

---

## Notes

- Package repo: https://github.com/friendlyinternet/nuxt-crouton (or wherever it's hosted)
- These issues discovered during crouton-bookings setup on 2024-12-08