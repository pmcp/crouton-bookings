export default {
  // Define all collections
  collections: [
    { name: 'bookings', fieldsFile: './schemas/booking-schema.json' },
    { name: 'locations', fieldsFile: './schemas/location-schema.json' },
    { name: 'emailTemplates', fieldsFile: './schemas/email-template-schema.json' },
    { name: 'pages', fieldsFile: './schemas/page-schema.json', hierarchy: true },
    { name: 'assets', fieldsFile: './schemas/asset-schema.json' },
    { name: 'settings', fieldsFile: './schemas/settings-schema.json' }
  ],

  // Organize into layers
  targets: [
    {
      layer: 'bookings',
      collections: ['bookings', 'locations', 'emailTemplates', 'pages', 'assets', 'settings']
    }
  ],

  // Database
  dialect: 'sqlite',

  // External connectors for :referenced collections
  connectors: {
    users: {
      type: 'supersaas',
      autoInstall: true,
      copyFiles: true,
      updateAppConfig: true
    },
    teamMembers: {
      type: 'supersaas',
      autoInstall: true,
      copyFiles: true,
      updateAppConfig: true
    }
  },

  // Flags
  flags: {
    force: false,
    noTranslations: false,
    noDb: false,
    dryRun: false,
    autoRelations: true,
    useTeamUtility: true,
    useMetadata: true,
    autoConnectors: true,
    useMaps: true
  }
}
