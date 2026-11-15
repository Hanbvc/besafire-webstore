import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `--mode static` builds a bundle that works from any sub-path or file host
// (relative asset URLs + hash routing, see .env.static). The default build
// assumes the site is served from the domain root with SPA fallback routing.
export default defineConfig(({ mode }) => ({
  base: mode === 'static' ? './' : '/',
  plugins: [react()],
}));
