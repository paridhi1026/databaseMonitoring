/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DBS_INSTANCE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
