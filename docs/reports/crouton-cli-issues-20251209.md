# Crouton CLI Issues Report

**Date:** 2025-12-09
**Context:** Testing hierarchy feature generation in crouton-bookings
**Packages:** `@friendlyinternet/nuxt-crouton-collection-generator` (locally linked)

---

## Issue 1: `pnpm crouton generate pages` doesn't work

**Error:**
```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "crouton" not found
Did you mean "pnpm crouton-generate"?
```

**Expected:** User should be able to run `pnpm crouton generate pages`
**Reality:** The CLI is registered as `crouton-generate`, not `crouton`

**Workaround tried:**
- `npx crouton-generate generate pages` → Error: `missing required argument 'collection'`
- The CLI expects: `npx crouton-generate generate <layer> <collection>` (TWO arguments)

### Suggested Fix
Add `crouton` as an alias in `package.json` bin:
```json
{
  "bin": {
    "crouton-generate": "./bin/cli.mjs",
    "crouton": "./bin/cli.mjs"
  }
}
```

---

## Issue 2: No single-collection regeneration from config

**Problem:** The plan file said `pnpm crouton generate pages` but there's no shortcut to regenerate just one collection from the config file.

**What worked:** `npx crouton-generate config ./crouton.config.mjs`
- This regenerated all 6 collections, not just pages
- Works but is slower and regenerates things that don't need it

### Suggested Fix
Add single-collection flag to config command:
```bash
npx crouton-generate config ./crouton.config.mjs --only pages
# or
npx crouton-generate config ./crouton.config.mjs pages
```

---

## Issue 3: Config file extension not auto-detected

**Error:**
```
Config file not found: /Users/pmcp/Projects/crouton-bookings/crouton.config.js
```

**Problem:** Default is `.js` but project uses `.mjs`. Had to explicitly specify path.

**Workaround:**
```bash
npx crouton-generate config ./crouton.config.mjs
```

### Suggested Fix
Auto-detect config extensions in order:
1. `crouton.config.js`
2. `crouton.config.mjs`
3. `crouton.config.cjs`
4. `crouton.config.ts`

---

## Issue 4: `--help` doesn't show hierarchy flag

**Current help output:**
```
Commands:
  config [configPath]                      Generate collections using a config file
  generate [options] <layer> <collection>  Generate a new CRUD collection
  ...
```

**Missing:** The `--hierarchy` flag added in Task 1.1 isn't documented in help

### Suggested Fix
Update CLI help to show:
```
generate [options] <layer> <collection>  Generate a new CRUD collection
  --hierarchy  Enable hierarchy support (parentId, path, depth, order)
```

---

## Issue 5: Generator Bug - Hierarchy fields missing from zod schema

**Problem:** When `hierarchy: true`, the generator:
- ✅ Adds hierarchy fields to database schema (parentId, path, depth, order)
- ✅ Adds tree queries (getTreeData, updatePosition, reorderSiblings)
- ✅ Generates move/reorder API endpoints
- ✅ Adds parent picker to Form.vue template
- ✅ Adds hierarchy config to composable
- ❌ Does NOT add `parentId` to zod schema
- ❌ Does NOT add `parentId` to defaultValues

**Impact:** TypeScript error in Form.vue:
```
Property 'parentId' does not exist on type '{ status: string; title: string; ... }'
```

**Location:** `lib/generators/composable.mjs`

### Suggested Fix
When `hierarchy.enabled`, modify composable generation to include:

```javascript
// In schema generation:
parentId: z.string().nullable().optional()

// In defaultValues:
parentId: null
```

---

## Summary of Required Fixes

| Priority | Issue | Fix Location | Effort |
|----------|-------|--------------|--------|
| High | Hierarchy missing from zod schema | `lib/generators/composable.mjs` | ~30 min |
| Medium | Add `crouton` alias | `package.json` | 5 min |
| Medium | Single-collection from config | `lib/commands/config.mjs` | ~1 hour |
| Low | Auto-detect config extensions | `lib/utils/config.mjs` | ~30 min |
| Low | Document `--hierarchy` flag | CLI help + docs | 15 min |

---

## Documentation Updates Needed (crouton-docs)

1. **CLI Reference Page:**
   - Correct command: `npx crouton-generate config ./crouton.config.mjs`
   - Document all config file extension variants
   - Add `--hierarchy` flag documentation

2. **Hierarchy Feature Guide:**
   - Document that regeneration uses `config` command, not `generate`
   - Show complete workflow: config → generate → migrate → test

3. **Troubleshooting:**
   - "Command not found" → use `npx crouton-generate` not `pnpm crouton`
   - Config file extension issues → specify full path with extension
