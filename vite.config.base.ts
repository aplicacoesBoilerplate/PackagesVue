import { defineConfig, type PluginOption } from 'vite';
import dts from 'vite-plugin-dts';

/** @description Opções compartilhadas para empacotar bibliotecas do monorepo. */
interface ILibraryConfigOptions {
  entry: string;
  external?: string[];
  plugins?: PluginOption[];
}

/** @description Cria a configuração de build para artefatos ESM, CJS e declarações. */
export function createLibraryConfig(pOptions: ILibraryConfigOptions) {
  return defineConfig({
    plugins: [
      ...(pOptions.plugins ?? []),
      dts({
        entryRoot: 'src',
        exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
        insertTypesEntry: true,
        tsconfigPath: './tsconfig.json',
      }),
    ],
    build: {
      emptyOutDir: true,
      lib: {
        entry: pOptions.entry,
        formats: ['es', 'cjs'],
        fileName: (pFormat) => `index.${pFormat === 'es' ? 'js' : 'cjs'}`,
      },
      rollupOptions: {
        external: pOptions.external,
      },
    },
  });
}
