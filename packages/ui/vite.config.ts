import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';

import { createLibraryConfig } from '../../vite.config.base';

export default createLibraryConfig({
  entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
  external: ['vue'],
  plugins: [vue()],
});
