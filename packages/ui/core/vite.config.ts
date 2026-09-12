import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';

import { createLibraryConfig } from '../../../vite.config.base';

export default createLibraryConfig({
  entry: {
    index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    'preview-loaders': fileURLToPath(
      new URL('./src/docs/preview-loaders.generated.ts', import.meta.url),
    ),
  },
  external: ['vue'],
  plugins: [vue()],
});
