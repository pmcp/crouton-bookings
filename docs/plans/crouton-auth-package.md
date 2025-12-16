# @crouton/auth Package Implementation Plan

> **Goal**: Create a Nuxt layer package that wraps Better Auth, providing authentication + teams + billing with three operational modes (multi-tenant, single-tenant, personal).

## Quick Stats

| Metric | Value |
|--------|-------|
| **Tasks Completed** | 3 / 45 |
| **Current Phase** | Phase 1 - Complete ✅ |
| **Estimated Total** | ~40-60 hours |

---

## Executive Summary

### What We're Building

`@crouton/auth` is a Nuxt layer that wraps [Better Auth](https://www.better-auth.com/) to provide:

1. **Authentication** - Email/password, OAuth, passkeys, 2FA, magic links
2. **Teams** (via Better Auth's Organization plugin) - Multi-tenant team management
3. **Billing** (via Better Auth's Stripe plugin) - Subscription management
4. **Three Modes** - Multi-tenant SaaS, single-tenant app, personal app

### Why Better Auth?

- Battle-tested auth implementation
- Built-in organization/team support
- Built-in Stripe billing
- Plugin architecture for extensibility
- Nuxt-native integration
- Active community & maintenance

### End Result

```typescript
// User's nuxt.config.ts - this is all they need
export default defineNuxtConfig({
  extends: ['@crouton/auth'],

  crouton: {
    auth: {
      mode: 'multi-tenant',
      oauth: {
        github: { clientId: '...', clientSecret: '...' }
      },
      billing: { enabled: true }
    }
  }
})
```

---

## Phase 1: Project Setup & Core Structure
**Estimated: 4-6 hours**

### Task 1.1: Initialize Package Structure ✅
- [x] Create new directory `packages/crouton-auth/`
- [x] Initialize `package.json` with correct dependencies
- [x] Set up TypeScript configuration
- [x] Create base `nuxt.config.ts` for the layer
- [x] Set up build tooling (unbuild or similar)

**Files to create:**
```
packages/crouton-auth/
├── package.json
├── tsconfig.json
├── nuxt.config.ts
├── app/
├── server/
└── types/
```

**Dependencies:**
```json
{
  "dependencies": {
    "better-auth": "^1.x",
    "@better-auth/cli": "^1.x",
    "drizzle-orm": "^0.x"
  },
  "peerDependencies": {
    "nuxt": "^3.x || ^4.x",
    "@nuxt/ui": "^3.x"
  }
}
```

### Task 1.2: Define Configuration Schema ✅
- [x] Create `types/config.ts` with full configuration interface
- [x] Define mode types: `'multi-tenant' | 'single-tenant' | 'personal'`
- [x] Define auth method options
- [x] Define OAuth provider configs
- [x] Define billing config options
- [x] Add JSDoc comments for all options

**Expected interface:**
```typescript
interface CroutonAuthConfig {
  mode: 'multi-tenant' | 'single-tenant' | 'personal'

  methods?: {
    password?: boolean | PasswordConfig
    oauth?: OAuthConfig
    passkeys?: boolean | PasskeyConfig
    twoFactor?: boolean | TwoFactorConfig
    magicLink?: boolean | MagicLinkConfig
    phone?: boolean | PhoneConfig
  }

  teams?: {
    allowCreate?: boolean
    limit?: number
    memberLimit?: number
    requireInvite?: boolean
  }

  billing?: {
    enabled?: boolean
    provider?: 'stripe'
    stripe?: StripeConfig
  }

  ui?: {
    theme?: 'default' | 'minimal'
    redirects?: RedirectConfig
  }
}
```

### Task 1.3: Create Module Entry Point ✅
- [x] Create `module.ts` as Nuxt module entry
- [x] Register runtime config from user config
- [x] Set up module hooks for configuration
- [x] Add config validation on module load

---

## Phase 2: Better Auth Integration
**Estimated: 8-12 hours**

### Task 2.1: Core Better Auth Setup
- [ ] Create `server/lib/auth.ts` - main auth instance factory
- [ ] Configure Drizzle adapter for SQLite (NuxtHub)
- [ ] Configure Drizzle adapter for PostgreSQL (optional)
- [ ] Set up session configuration
- [ ] Implement base email/password authentication

**Core implementation:**
```typescript
// server/lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const createAuth = (config: CroutonAuthConfig, db: DrizzleDB) => {
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite' }),
    emailAndPassword: {
      enabled: config.methods?.password !== false
    },
    // ... rest of config
  })
}
```

### Task 2.2: Organization Plugin (Teams)
- [ ] Configure organization plugin for all modes
- [ ] Set up default roles (owner, admin, member)
- [ ] Configure invitation system
- [ ] Implement team limits based on config
- [ ] Add sub-team support (optional)

**Mode-specific behavior:**
```typescript
organization({
  // Multi-tenant: users create/join multiple orgs
  allowUserToCreateOrganization: config.mode === 'multi-tenant',

  // Single-tenant: one org, many users
  // Personal: one org per user
  organizationLimit: config.mode === 'personal' ? 1 : undefined,
})
```

### Task 2.3: OAuth Providers
- [ ] Configure GitHub OAuth
- [ ] Configure Google OAuth
- [ ] Configure Discord OAuth
- [ ] Add support for additional providers (configurable)
- [ ] Handle OAuth callback URLs

### Task 2.4: Passkey Plugin
- [ ] Configure passkey/WebAuthn plugin
- [ ] Set up rpID and rpName from config
- [ ] Handle credential registration
- [ ] Handle credential authentication
- [ ] Support conditional UI (autofill)

### Task 2.5: Two-Factor Authentication
- [ ] Configure 2FA plugin
- [ ] Set up TOTP support
- [ ] Implement backup codes
- [ ] Add trusted device management

### Task 2.6: Stripe Billing Plugin
- [ ] Configure Stripe plugin
- [ ] Set up webhook handling
- [ ] Configure subscription plans
- [ ] Implement checkout flow
- [ ] Handle billing portal redirect
- [ ] Support organization-based billing (multi-tenant)
- [ ] Support user-based billing (personal mode)

### Task 2.7: API Route Handler
- [ ] Create `/server/api/auth/[...all].ts` catch-all route
- [ ] Map Better Auth handler to Nuxt event handler
- [ ] Ensure proper request/response transformation

```typescript
// server/api/auth/[...all].ts
export default defineEventHandler(async (event) => {
  const auth = useAuth()
  return auth.handler(toWebRequest(event))
})
```

---

## Phase 3: Mode Implementation
**Estimated: 6-8 hours**

### Task 3.1: Multi-Tenant Mode
- [ ] Allow organization creation by users
- [ ] Enable organization switching
- [ ] Support multiple organizations per user
- [ ] URL pattern: `/dashboard/[team]/...`
- [ ] Team context in session

### Task 3.2: Single-Tenant Mode
- [ ] Auto-create default organization on first boot
- [ ] Auto-add all new users to default org
- [ ] Hide organization switcher
- [ ] Simplified URL pattern: `/dashboard/...`
- [ ] Auto-select default org in session

**Implementation:**
```typescript
// server/plugins/single-tenant-init.ts
export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig().crouton.auth
  if (config.mode !== 'single-tenant') return

  const defaultOrg = await getOrCreateDefaultOrganization()
  // Store default org ID for auto-assignment
})
```

### Task 3.3: Personal Mode
- [ ] Auto-create organization when user registers
- [ ] One org per user (user is always owner)
- [ ] Hide organization management UI
- [ ] Optional: allow collaboration (invite to personal org)
- [ ] URL pattern: `/dashboard/...`

**Implementation:**
```typescript
// Hook into user registration
hooks: {
  after: {
    signUp: async ({ user }) => {
      if (config.mode === 'personal') {
        await createOrganization({
          name: `${user.name}'s Workspace`,
          ownerId: user.id,
          personal: true
        })
      }
    }
  }
}
```

### Task 3.4: Team Context Middleware
- [ ] Create `middleware/team-context.global.ts`
- [ ] Auto-resolve team based on mode
- [ ] Multi-tenant: from URL param or session
- [ ] Single/Personal: from session (auto-selected)
- [ ] Inject team into `event.context` and `useState`

### Task 3.5: Route Generation by Mode
- [ ] Multi-tenant: generate `/dashboard/[team]/...` routes
- [ ] Single/Personal: generate `/dashboard/...` routes
- [ ] Use Nuxt hooks to transform page routes based on mode

---

## Phase 4: Composables & Utilities
**Estimated: 6-8 hours**

### Task 4.1: useAuth Composable
- [ ] Create `composables/useAuth.ts`
- [ ] Wrap Better Auth's client functionality
- [ ] Provide reactive user state
- [ ] Expose login/logout/register methods
- [ ] Expose method availability flags

```typescript
export const useAuth = () => {
  const client = useBetterAuthClient()
  const session = useSession()

  return {
    user: computed(() => session.value?.user),
    loggedIn: computed(() => !!session.value?.user),

    // Methods
    login: client.signIn.email,
    loginWithOAuth: (provider: string) => client.signIn.social({ provider }),
    register: client.signUp.email,
    logout: client.signOut,

    // Capabilities
    hasPassword: computed(() => config.methods?.password !== false),
    hasOAuth: computed(() => !!config.methods?.oauth),
    hasPasskeys: computed(() => !!config.methods?.passkeys),
    has2FA: computed(() => !!config.methods?.twoFactor),
    oauthProviders: computed(() => Object.keys(config.methods?.oauth ?? {})),
  }
}
```

### Task 4.2: useTeam Composable
- [ ] Create `composables/useTeam.ts`
- [ ] Wrap Better Auth organization client
- [ ] Provide reactive team state
- [ ] Handle team switching
- [ ] Mode-aware behavior

```typescript
export const useTeam = () => {
  const config = useRuntimeConfig().crouton.auth
  const session = useSession()

  return {
    currentTeam: computed(() => session.value?.activeOrganization),
    teams: computed(() => session.value?.organizations ?? []),

    // Mode-aware flags
    showTeamSwitcher: computed(() =>
      config.mode === 'multi-tenant' && teams.value.length > 1
    ),
    showTeamManagement: computed(() =>
      config.mode === 'multi-tenant'
    ),
    canCreateTeam: computed(() =>
      config.mode === 'multi-tenant' && config.teams?.allowCreate !== false
    ),

    // Methods
    switchTeam: (teamId: string) => client.organization.setActive({ organizationId: teamId }),
    createTeam: (data) => client.organization.create(data),
    inviteMember: (data) => client.organization.inviteMember(data),
  }
}
```

### Task 4.3: useBilling Composable
- [ ] Create `composables/useBilling.ts`
- [ ] Wrap Better Auth Stripe client
- [ ] Provide subscription state
- [ ] Handle checkout/portal flows

```typescript
export const useBilling = () => {
  const config = useRuntimeConfig().crouton.auth

  if (!config.billing?.enabled) {
    return {
      enabled: false,
      subscription: null,
      // Stub methods that warn
    }
  }

  return {
    enabled: true,
    subscription: computed(() => /* ... */),

    checkout: (planId: string) => client.subscription.upgrade({ plan: planId }),
    portal: () => client.subscription.portal(),
    cancel: () => client.subscription.cancel(),
  }
}
```

### Task 4.4: Server Utilities
- [ ] Create `server/utils/auth.ts`
- [ ] `requireAuth(event)` - throws if not authenticated
- [ ] `requireTeamMember(event)` - throws if not team member
- [ ] `requireTeamAdmin(event)` - throws if not admin
- [ ] `requireTeamOwner(event)` - throws if not owner
- [ ] `getAuthUser(event)` - returns user or null
- [ ] `getTeamContext(event)` - returns current team

```typescript
// server/utils/auth.ts
export const requireAuth = async (event: H3Event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return session.user
}

export const requireTeamMember = async (event: H3Event) => {
  const user = await requireAuth(event)
  const team = getTeamFromContext(event)

  const member = await auth.api.organization.getMember({
    organizationId: team.id,
    userId: user.id
  })

  if (!member) {
    throw createError({ statusCode: 403, message: 'Not a team member' })
  }

  return { user, team, member }
}
```

### Task 4.5: Type Exports
- [ ] Export User type
- [ ] Export Team/Organization type
- [ ] Export Session type
- [ ] Export Member type with roles
- [ ] Export Subscription type
- [ ] Ensure types work with Nuxt's auto-imports

---

## Phase 5: UI Components (Nuxt UI)
**Estimated: 10-14 hours**

### Task 5.1: Auth Pages
- [ ] Create `pages/auth/login.vue`
- [ ] Create `pages/auth/register.vue`
- [ ] Create `pages/auth/forgot-password.vue`
- [ ] Create `pages/auth/reset-password.vue`
- [ ] Create `pages/auth/verify-email.vue`
- [ ] Create `pages/auth/magic-link.vue` (if enabled)

**Login page features:**
- Email/password form (if enabled)
- OAuth buttons (configured providers only)
- Passkey button (if enabled)
- Magic link option (if enabled)
- "Remember me" option
- Redirect after login

### Task 5.2: Auth Components
- [ ] Create `components/Auth/LoginForm.vue`
- [ ] Create `components/Auth/RegisterForm.vue`
- [ ] Create `components/Auth/OAuthButtons.vue`
- [ ] Create `components/Auth/PasskeyButton.vue`
- [ ] Create `components/Auth/MagicLinkForm.vue`
- [ ] Create `components/Auth/TwoFactorForm.vue`
- [ ] Create `components/Auth/ForgotPasswordForm.vue`

**Component pattern:**
```vue
<!-- components/Auth/LoginForm.vue -->
<script setup lang="ts">
const { login, hasPassword, hasOAuth, oauthProviders } = useAuth()
const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    await login(form)
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm :state="form" @submit="handleSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="form.email" type="email" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput v-model="form.password" type="password" />
    </UFormField>

    <UCheckbox v-model="form.rememberMe" label="Remember me" />

    <UButton type="submit" :loading="loading" block>
      Sign In
    </UButton>

    <UAlert v-if="error" color="error" :title="error" />
  </UForm>
</template>
```

### Task 5.3: Team Components
- [ ] Create `components/Team/Switcher.vue`
- [ ] Create `components/Team/CreateForm.vue`
- [ ] Create `components/Team/Settings.vue`
- [ ] Create `components/Team/Members.vue`
- [ ] Create `components/Team/MemberInviteForm.vue`
- [ ] Create `components/Team/MemberRow.vue`
- [ ] Create `components/Team/Invitations.vue`
- [ ] Create `components/Team/DeleteConfirm.vue`

### Task 5.4: Account Components
- [ ] Create `components/Account/Settings.vue`
- [ ] Create `components/Account/ProfileForm.vue`
- [ ] Create `components/Account/PasswordForm.vue`
- [ ] Create `components/Account/PasskeyManager.vue`
- [ ] Create `components/Account/TwoFactorSetup.vue`
- [ ] Create `components/Account/LinkedAccounts.vue`
- [ ] Create `components/Account/DeleteAccount.vue`

### Task 5.5: Billing Components
- [ ] Create `components/Billing/PlanCard.vue`
- [ ] Create `components/Billing/PricingTable.vue`
- [ ] Create `components/Billing/CurrentPlan.vue`
- [ ] Create `components/Billing/UpgradeButton.vue`
- [ ] Create `components/Billing/PortalButton.vue`
- [ ] Create `components/Billing/UsageDisplay.vue` (optional)

### Task 5.6: Dashboard Pages
- [ ] Create `pages/dashboard/index.vue` (redirect or overview)
- [ ] Create `pages/dashboard/settings/index.vue` (account)
- [ ] Create `pages/dashboard/settings/security.vue`
- [ ] Create `pages/dashboard/settings/team.vue` (if multi-tenant)
- [ ] Create `pages/dashboard/settings/members.vue` (if multi-tenant)
- [ ] Create `pages/dashboard/settings/billing.vue` (if billing enabled)

### Task 5.7: Layout Components
- [ ] Create `components/Sidebar/AuthSidebar.vue`
- [ ] Create `components/Sidebar/TeamSection.vue`
- [ ] Create `components/Sidebar/UserMenu.vue`
- [ ] Create `layouts/dashboard.vue`
- [ ] Create `layouts/auth.vue`

---

## Phase 6: Database & Migrations
**Estimated: 4-6 hours**

### Task 6.1: Schema Integration
- [ ] Export Better Auth schema for Drizzle
- [ ] Create `server/database/schema/auth.ts`
- [ ] Include users table
- [ ] Include sessions table
- [ ] Include accounts table (OAuth)
- [ ] Include organizations table
- [ ] Include members table
- [ ] Include invitations table
- [ ] Include subscriptions table (if billing)

### Task 6.2: Schema Extensions
- [ ] Add custom fields to users table (if needed)
- [ ] Add `personal` flag to organizations
- [ ] Add `isDefault` flag for single-tenant mode
- [ ] Create index for common queries

### Task 6.3: Migration Support
- [ ] Document migration command: `npx @better-auth/cli migrate`
- [ ] Create migration helper script
- [ ] Test fresh install migrations
- [ ] Test upgrade migrations (existing data)

### Task 6.4: Seed Data (Development)
- [ ] Create dev seed script
- [ ] Seed default organization (single-tenant)
- [ ] Seed test users
- [ ] Seed test subscriptions

---

## Phase 7: Testing & Documentation
**Estimated: 6-8 hours**

### Task 7.1: Unit Tests
- [ ] Test `useAuth` composable
- [ ] Test `useTeam` composable
- [ ] Test `useBilling` composable
- [ ] Test server utilities
- [ ] Test mode-specific behavior

### Task 7.2: Integration Tests
- [ ] Test login flow
- [ ] Test registration flow
- [ ] Test OAuth flow
- [ ] Test team creation
- [ ] Test team invitation
- [ ] Test billing checkout

### Task 7.3: E2E Tests (Playwright)
- [ ] Test complete auth flow
- [ ] Test team management flow
- [ ] Test billing flow
- [ ] Test mode switching

### Task 7.4: Documentation
- [ ] Write README.md with quick start
- [ ] Document all configuration options
- [ ] Document composables API
- [ ] Document components API
- [ ] Document server utilities
- [ ] Create examples for each mode
- [ ] Document migration from SuperSaaS

---

## Phase 8: Integration & Polish
**Estimated: 4-6 hours**

### Task 8.1: Crouton Collection Integration
- [ ] Create hook for injecting team context into collections
- [ ] Auto-scope queries to current team
- [ ] Document pattern for collection authors

```typescript
// How collections will use it
const { items } = useBookings()
// Internally: WHERE teamId = currentTeam.id
```

### Task 8.2: Error Handling
- [ ] Standardize error messages
- [ ] Add i18n support for errors
- [ ] Create error boundary components
- [ ] Handle network errors gracefully

### Task 8.3: Loading States
- [ ] Add loading skeletons to all pages
- [ ] Add loading states to all forms
- [ ] Ensure no flash of unauthenticated content

### Task 8.4: Security Review
- [ ] Review CSRF protection
- [ ] Review session security
- [ ] Review rate limiting
- [ ] Review input validation
- [ ] Test for common vulnerabilities

### Task 8.5: Performance
- [ ] Minimize client bundle size
- [ ] Lazy load non-critical components
- [ ] Optimize database queries
- [ ] Add caching where appropriate

### Task 8.6: Final Polish
- [ ] Ensure consistent styling
- [ ] Add transitions/animations
- [ ] Test dark mode
- [ ] Test responsive design
- [ ] Cross-browser testing

---

## Phase 9: Release Preparation
**Estimated: 2-4 hours**

### Task 9.1: Package Publishing
- [ ] Finalize package.json
- [ ] Set up npm publishing
- [ ] Create CHANGELOG.md
- [ ] Tag first release

### Task 9.2: Example Project
- [ ] Create `examples/multi-tenant/`
- [ ] Create `examples/single-tenant/`
- [ ] Create `examples/personal/`
- [ ] Test fresh install experience

### Task 9.3: Migration Guide
- [ ] Document migration from SuperSaaS
- [ ] Provide code transformation examples
- [ ] List breaking changes
- [ ] Create migration checklist

---

## Technical Specifications

### Environment Variables

```bash
# Required
BETTER_AUTH_SECRET=           # Session encryption
DATABASE_URL=                 # Database connection (if not using NuxtHub)

# OAuth (optional, per provider)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Billing (optional)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Passkeys (optional)
PASSKEY_RP_ID=               # e.g., "example.com"
PASSKEY_RP_NAME=             # e.g., "My App"

# 2FA (optional)
TWO_FACTOR_ISSUER=           # e.g., "My App"
```

### File Structure

```
packages/crouton-auth/
├── package.json
├── tsconfig.json
├── nuxt.config.ts
├── module.ts                          # Nuxt module entry
│
├── app/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.vue
│   │   │   ├── RegisterForm.vue
│   │   │   ├── OAuthButtons.vue
│   │   │   ├── PasskeyButton.vue
│   │   │   ├── MagicLinkForm.vue
│   │   │   ├── TwoFactorForm.vue
│   │   │   └── ForgotPasswordForm.vue
│   │   ├── Team/
│   │   │   ├── Switcher.vue
│   │   │   ├── CreateForm.vue
│   │   │   ├── Settings.vue
│   │   │   ├── Members.vue
│   │   │   ├── MemberInviteForm.vue
│   │   │   └── Invitations.vue
│   │   ├── Account/
│   │   │   ├── Settings.vue
│   │   │   ├── ProfileForm.vue
│   │   │   ├── PasswordForm.vue
│   │   │   ├── PasskeyManager.vue
│   │   │   └── TwoFactorSetup.vue
│   │   ├── Billing/
│   │   │   ├── PlanCard.vue
│   │   │   ├── PricingTable.vue
│   │   │   ├── CurrentPlan.vue
│   │   │   └── PortalButton.vue
│   │   └── Sidebar/
│   │       ├── AuthSidebar.vue
│   │       ├── TeamSection.vue
│   │       └── UserMenu.vue
│   │
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useTeam.ts
│   │   ├── useBilling.ts
│   │   └── useSession.ts
│   │
│   ├── layouts/
│   │   ├── auth.vue
│   │   └── dashboard.vue
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── guest.ts
│   │   └── team-context.global.ts
│   │
│   └── pages/
│       ├── auth/
│       │   ├── login.vue
│       │   ├── register.vue
│       │   ├── forgot-password.vue
│       │   ├── reset-password.vue
│       │   └── verify-email.vue
│       └── dashboard/
│           ├── index.vue
│           └── settings/
│               ├── index.vue
│               ├── security.vue
│               ├── team.vue
│               ├── members.vue
│               └── billing.vue
│
├── server/
│   ├── api/
│   │   └── auth/
│   │       └── [...all].ts            # Better Auth handler
│   │
│   ├── database/
│   │   └── schema/
│   │       └── auth.ts                # Better Auth + extensions
│   │
│   ├── lib/
│   │   └── auth.ts                    # Better Auth instance factory
│   │
│   ├── middleware/
│   │   └── auth.ts                    # Server auth middleware
│   │
│   ├── plugins/
│   │   ├── auth-init.ts               # Initialize auth on startup
│   │   └── single-tenant-init.ts      # Single-tenant setup
│   │
│   └── utils/
│       ├── auth.ts                    # requireAuth, etc.
│       └── team.ts                    # Team utilities
│
├── types/
│   ├── config.ts                      # Configuration types
│   ├── auth.ts                        # Auth types
│   └── index.ts                       # Re-exports
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### API Reference

#### Composables

```typescript
// useAuth()
{
  user: ComputedRef<User | null>
  loggedIn: ComputedRef<boolean>
  login(email: string, password: string): Promise<void>
  loginWithOAuth(provider: string): Promise<void>
  loginWithPasskey(): Promise<void>
  register(data: RegisterData): Promise<void>
  logout(): Promise<void>
  forgotPassword(email: string): Promise<void>
  resetPassword(token: string, password: string): Promise<void>

  // Capabilities
  hasPassword: ComputedRef<boolean>
  hasOAuth: ComputedRef<boolean>
  hasPasskeys: ComputedRef<boolean>
  has2FA: ComputedRef<boolean>
  oauthProviders: ComputedRef<string[]>
}

// useTeam()
{
  currentTeam: ComputedRef<Team | null>
  teams: ComputedRef<Team[]>
  role: ComputedRef<'owner' | 'admin' | 'member' | null>

  switchTeam(teamId: string): Promise<void>
  createTeam(data: CreateTeamData): Promise<Team>
  updateTeam(data: UpdateTeamData): Promise<Team>
  deleteTeam(): Promise<void>

  inviteMember(email: string, role: string): Promise<void>
  removeMember(userId: string): Promise<void>
  updateMemberRole(userId: string, role: string): Promise<void>

  // Mode-aware flags
  showTeamSwitcher: ComputedRef<boolean>
  showTeamManagement: ComputedRef<boolean>
  canCreateTeam: ComputedRef<boolean>
  canInviteMembers: ComputedRef<boolean>
  canManageMembers: ComputedRef<boolean>
}

// useBilling()
{
  enabled: ComputedRef<boolean>
  subscription: ComputedRef<Subscription | null>
  plan: ComputedRef<Plan | null>
  status: ComputedRef<'active' | 'trialing' | 'canceled' | 'past_due' | null>

  checkout(planId: string): Promise<void>
  portal(): Promise<void>
  cancel(): Promise<void>
  resume(): Promise<void>

  isPro: ComputedRef<boolean>
  isTrialing: ComputedRef<boolean>
  isCanceled: ComputedRef<boolean>
}
```

#### Server Utilities

```typescript
// Require authentication
const user = await requireAuth(event)

// Require team membership
const { user, team, member } = await requireTeamMember(event)

// Require team admin
const { user, team, member } = await requireTeamAdmin(event)

// Require team owner
const { user, team } = await requireTeamOwner(event)

// Optional auth (returns null if not authenticated)
const user = await getAuthUser(event)

// Get team context
const team = getTeamContext(event)
```

---

## Daily Log

### Day 1: 2024-12-16
**Tasks completed:**
- Task 1.1: Initialize Package Structure
- Task 1.2: Define Configuration Schema
- Task 1.3: Create Module Entry Point

**Notes:**
- Created full package structure in `packages/crouton-auth/`
- Defined comprehensive TypeScript types for all configuration options
- Created module.ts with Nuxt module hooks and config validation
- Added placeholder composables (useAuth, useTeam, useBilling, useSession)
- Added server utilities (requireAuth, requireTeamMember, etc.)
- Added middleware stubs (auth, guest, team-context)
- Added API route handler stub for Better Auth

**Blockers:**
- None. Phase 1 complete.

---

## Dependencies

### Runtime Dependencies
- `better-auth` - Core authentication
- `drizzle-orm` - Database ORM

### Peer Dependencies
- `nuxt` ^3.x or ^4.x
- `@nuxt/ui` ^3.x

### Dev Dependencies
- `@better-auth/cli` - Migration CLI
- `vitest` - Unit testing
- `@playwright/test` - E2E testing
- `unbuild` - Package building

---

## References

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- [Better Auth Stripe Plugin](https://www.better-auth.com/docs/plugins/stripe)
- [Better Auth Nuxt Integration](https://www.better-auth.com/docs/integrations/nuxt)
- [Nuxt Layers Documentation](https://nuxt.com/docs/getting-started/layers)
- [Nuxt UI Components](https://ui.nuxt.com/)

---

## Success Criteria

The package is complete when:

1. [ ] Fresh Nuxt app can add `@crouton/auth` and have working auth
2. [ ] All three modes work correctly (multi-tenant, single-tenant, personal)
3. [ ] OAuth providers work out of the box
4. [ ] Passkeys work out of the box
5. [ ] 2FA works out of the box
6. [ ] Stripe billing works out of the box
7. [ ] All UI components render correctly with Nuxt UI
8. [ ] TypeScript types are complete and accurate
9. [ ] Documentation covers all features
10. [ ] Tests pass with >80% coverage
11. [ ] Example projects demonstrate each mode
12. [ ] Migration guide enables SuperSaaS users to switch
