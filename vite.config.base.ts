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
        exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/docs/**/*.ts'],
        insertTypesEntry: true,
        tsconfigPath: './tsconfig.json',
      }),
    ],
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
