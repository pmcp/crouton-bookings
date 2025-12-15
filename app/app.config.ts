import { teamMembersConfig } from '@friendlyinternet/nuxt-crouton-supersaas/supersaas'
import { translationsUiConfig } from '@friendlyinternet/nuxt-crouton-i18n/app/composables/useTranslationsUi'
import { bookingsBookingsConfig } from '../layers/bookings/collections/bookings/app/composables/useBookingsBookings'
import { bookingsLocationsConfig } from '../layers/bookings/collections/locations/app/composables/useBookingsLocations'
import { bookingsEmailTemplatesConfig } from '../layers/bookings/collections/emailtemplates/app/composables/useBookingsEmailTemplates'
import { bookingsPagesConfig } from '../layers/bookings/collections/pages/app/composables/useBookingsPages'
import { bookingsAssetsConfig } from '../layers/bookings/collections/assets/app/composables/useBookingsAssets'
import { bookingsSettingsConfig } from '../layers/bookings/collections/settings/app/composables/useBookingsSettings'
import { bookingsEmailLogsConfig } from '../layers/bookings/collections/emaillogs/app/composables/useBookingsEmailLogs'
export default defineAppConfig({
  croutonCollections: {
    translationsUi: translationsUiConfig,
    bookingsEmailLogs: bookingsEmailLogsConfig,
    bookingsSettings: bookingsSettingsConfig,
    bookingsAssets: bookingsAssetsConfig,
    bookingsPages: bookingsPagesConfig,
    bookingsEmailTemplates: bookingsEmailTemplatesConfig,
    bookingsLocations: bookingsLocationsConfig,
    teamMembers: teamMembersConfig,
    bookingsBookings: bookingsBookingsConfig,
  },
  ui: {
    icons: {
      loading: 'i-lucide-loader-circle',
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
    },
    colors: {
      primary: 'emerald',
      neutral: 'neutral',
    },
  },
  seo: {
    title: 'Supersaas',
    description: 'The fullstack Nuxt 3 SaaS starter kit',
  },
})
