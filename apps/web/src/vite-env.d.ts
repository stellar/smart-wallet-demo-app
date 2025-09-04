/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_X_API_KEY: string
  readonly VITE_THEME_SWITCH_ENABLED: string
  readonly VITE_ENVIRONMENT_NAME: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GIFT_STORAGE_BASE_URL: string
  readonly VITE_TERMS_OF_SERVICE_URL: string
  readonly VITE_PRIVACY_POLICE_URL: string
  readonly VITE_ADDENDUM_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
