import './env'
import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  extends: [
    // External nuxt-crouton packages
    '@friendlyinternet/nuxt-crouton',
    '@friendlyinternet/nuxt-crouton-supersaas',
    '@friendlyinternet/nuxt-crouton-editor',
    '@friendlyinternet/nuxt-crouton-maps',
    '@friendlyinternet/nuxt-crouton-i18n',
    // Local crouton-auth layer (Better Auth integration)
    // NOTE: Must come AFTER nuxt-crouton to override #crouton/team-auth alias
    './packages/crouton-auth',
    // Application layers
    './layers/bookings',
    './layers/customer-booking',
    './layers/public',
  ],
  modules: [
    '@nuxthub/core',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    'nuxthub-ratelimit',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system',
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
    emailProvider: process.env.EMAIL_PROVIDER,
    // @ts-expect-error - We're just extending the type
    session: {
      maxAge: 60 * 60 * 24 * 7, // Session expires after 7 days - change it accordingly
    },
    public: {
      host: process.env.BASE_URL,
    },
  },
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2024-07-30',
  vite: {
    server: {
      fs: {
        allow: [
          // Allow mapbox-gl CSS from linked nuxt-crouton package
          '/Users/pmcp/Projects/nuxt-crouton/node_modules',
        ],
      },
    },
  },
  nitro: {
    rollupConfig: {
      // @ts-expect-error - Rollup plugin type definitions are incomplete for vue plugin
      plugins: [vue()],
    },
    experimental: {
      tasks: true,
    },
    // Handle locally linked packages that ship TypeScript source files
    externals: {
      inline: [
        '@friendlyinternet/nuxt-crouton',
      ],
    },
  },
  hub: {
    database: true,
    blob: true,
    kv: true,
  },
  auth: {
    webAuthn: true,
  },
  eslint: {
    config: {
      standalone: true,
      typescript: {
        // Disables strict rules - recommended are still enabled
        strict: false,
        // Enables type-checking - this has a significant performance impact
        tsconfigPath: './tsconfig.json',
      },
      stylistic: {
        indent: 2,
        semi: false,
        quotes: 'single',
        commaDangle: 'always-multiline',
      },
    },
  },
  nuxtHubRateLimit: {
    routes: {
      '/api/auth/*': {
        maxRequests: 15,
        intervalSeconds: 60, // Minimum 60 seconds due to NuxtHub KV TTL limitation
      },
      '/api/**': {
        maxRequests: 150,
        intervalSeconds: 60, // Minimum 60 seconds due to NuxtHub KV TTL limitation
      },
    },
  },
})
