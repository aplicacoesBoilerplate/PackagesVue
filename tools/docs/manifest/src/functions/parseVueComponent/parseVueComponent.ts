import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { parse } from '@vue/compiler-sfc';

import type { IManifestExport } from '../../models/IManifest.model';
import { parseCssTokens } from './parseCssTokens';
import { parseProps } from './parseProps';

/**
 * @description Lê um componente Vue e extrai props e tokens CSS configuráveis.
 * @property {string} pFilePath - .
 * @property {string} pExportName - .
 * @property {string} pSourcePath - .
 * @returns {IManifestExport} Usando funções auxiliares, extraímos todas as informações de um componente para montar o manifesto
 */
export function parseVueComponent(
  pFilePath: string,
  pExportName: string,
  pSourcePath: string,
): IManifestExport {
  const source = readFileSync(pFilePath, 'utf8');
  const { descriptor, errors } = parse(source, { filename: pFilePath });

  if (errors.length > 0) {
    throw new Error(`Não foi possível analisar o componente: ${pFilePath}`);
  }

  const scriptContent = descriptor.scriptSetup?.content ?? descriptor.script?.content ?? '';
  const props = parseProps(scriptContent);
  const cssTokens = descriptor.styles.flatMap((pStyle) => {
    const styleContent = pStyle.src
      ? readFileSync(resolve(dirname(pFilePath), pStyle.src), 'utf8')
      : pStyle.content;

    return parseCssTokens(styleContent);
  });

  return {
    name: pExportName,
    kind: 'component',
    source: pSourcePath,
    props,
    cssTokens,
  };
}
