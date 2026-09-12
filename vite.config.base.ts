import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { ILibraryConfigOptions } from './models/interfaces/ILibraryConfigOptions';

/**
 * @description Cria a configuração de build para artefatos ESM, CJS e declarações.
 * @param {ILibraryConfigOptions} pOptions - Entradas, plugins e dependências externas da biblioteca.
 * @returns Configuração Vite compartilhada pelo monorepo.
 */
export function createLibraryConfig(pOptions: ILibraryConfigOptions) {
  return defineConfig({
    plugins: [
      ...(pOptions.plugins ?? []),
      dts({
        entryRoot: 'src',
        exclude: [
          'src/**/*.spec.ts',
          'src/**/*.test.ts',
          'src/docs/**/*.ts',
          'src/**/CRegister*.ts',
        ],
        insertTypesEntry: true,
        tsconfigPath: './tsconfig.json',
      }),
    ],
    resolve: {
      alias: [
        // packages
        {
          find: /^@core$/,
          replacement: fileURLToPath(new URL('./packages/ui/core/src/index.ts', import.meta.url)),
        },
        {
          find: '@core',
          replacement: fileURLToPath(new URL('./packages/ui/core/src', import.meta.url)),
        },
        {
          find: /^@primeVue$/,
          replacement: fileURLToPath(
            new URL('./packages/ui/prime-vue/src/index.ts', import.meta.url),
          ),
        },
        {
          find: '@primeVue',
          replacement: fileURLToPath(new URL('./packages/ui/prime-vue/src', import.meta.url)),
        },
        {
          find: /^@vuetify$/,
          replacement: fileURLToPath(
            new URL('./packages/ui/vuetify/src/index.ts', import.meta.url),
          ),
        },
        {
          find: '@vuetify',
          replacement: fileURLToPath(new URL('./packages/ui/vuetify/src', import.meta.url)),
        },

        // Ferramentas
        { find: '@tools', replacement: fileURLToPath(new URL('./tools', import.meta.url)) },
        {
          find: '@manifest',
          replacement: fileURLToPath(new URL('./tools/docs/manifest/src', import.meta.url)),
        },
      ],
    },
    build: {
      emptyOutDir: true,
      lib: {
        entry: pOptions.entry,
        formats: ['es', 'cjs'],
        fileName: (pFormat, pEntryName) => `${pEntryName}.${pFormat === 'es' ? 'js' : 'cjs'}`,
        cssFileName: 'style',
      },
      rollupOptions: {
        external: pOptions.external,
      },
    },
  });
}
