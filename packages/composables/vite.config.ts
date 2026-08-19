import { fileURLToPath, URL } from 'node:url';

import { createLibraryConfig } from '../../vite.config.base';

export default createLibraryConfig({
  entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
  external: ['vue'],
});
