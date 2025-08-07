/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_THEME_SWITCH_ENABLED: string
  readonly VITE_ENVIRONMENT_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
