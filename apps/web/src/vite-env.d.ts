/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | undefined;
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}