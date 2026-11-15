/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "hash" switches to hash-based routing for static/sub-path hosting. */
  readonly VITE_ROUTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
