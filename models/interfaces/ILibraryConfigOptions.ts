import type { RollupOptions } from 'rollup';
import type { PluginOption } from 'vite';

/** @description Opções compartilhadas para empacotar bibliotecas do monorepo. */
export interface ILibraryConfigOptions {
  entry: string | Record<string, string>;
  external?: RollupOptions['external'];
  plugins?: PluginOption[];
}
