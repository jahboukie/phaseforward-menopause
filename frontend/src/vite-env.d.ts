/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_SENTIMENTASASERVICE_API_KEY: string
  readonly VITE_AWS_REGION: string
  readonly VITE_AWS_ACCESS_KEY_ID: string
  readonly VITE_AWS_SECRET_ACCESS_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}