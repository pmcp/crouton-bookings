import { basename } from 'path'

const layerName = basename(__dirname)

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: './components',
        prefix: layerName,
        global: true // Makes them available globally
      }
    ]
  },
  extends: [
    './collections/bookings',
    './collections/locations',
    './collections/emailtemplates',
    './collections/pages',
    './collections/assets',
    './collections/settings',
    './collections/emaillogs'
  ],
  i18n: {
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'nl', file: 'nl.json' },
      { code: 'fr', file: 'fr.json' }
    ],
    langDir: './locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    }
  }
})
