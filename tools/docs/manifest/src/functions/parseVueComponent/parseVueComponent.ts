import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { parse } from '@vue/compiler-sfc';

import type { IManifestExport } from '../../models/IManifest.model';

import { parseCssTokens } from './parseCssTokens';
import { parseEmits } from './parseEmits';
import { parseExamples } from './parseExamples';
import { parseExposes } from './parseExposes';
import { parseModels } from './parseModels';
import { parseProps } from './parseProps';
import { parseSlots } from './parseSlots';
import { parseSnippets } from './parseSnippets';

interface IParseVueComponentOptions {
  parseDocumentationAssets?: boolean;
}

/**
 * @description Lê um componente Vue e extrai sua API pública e tokens CSS configuráveis.
 * @param {string} pFilePath - Caminho absoluto do arquivo Vue analisado.
 * @param {string} pExportName - Nome público reexportado pelo package.
 * @param {string} pSourcePath - Caminho do componente relativo ao package.
 * @param {IParseVueComponentOptions} pOptions - Define se assets editoriais legados serão lidos.
 * @returns {IManifestExport} API pública extraída do componente.
 */
export function parseVueComponent(
  pFilePath: string,
  pExportName: string,
  pSourcePath: string,
  pOptions: IParseVueComponentOptions = {},
): IManifestExport {
  const lSource = readFileSync(pFilePath, 'utf8');
  const { descriptor: lDescriptor, errors: lErrors } = parse(lSource, { filename: pFilePath });

  if (lErrors.length > 0) {
    throw new Error(`Não foi possível analisar o componente: ${pFilePath}`);
  }

  const lScriptContent = lDescriptor.scriptSetup?.content ?? lDescriptor.script?.content ?? '';
  const lProps = parseProps(pFilePath, lScriptContent);
  const lCssTokens = lDescriptor.styles.flatMap((pStyle) => {
    const lStyleContent = pStyle.src
      ? readFileSync(resolve(dirname(pFilePath), pStyle.src), 'utf8')
      : pStyle.content;

    return parseCssTokens(lStyleContent);
  });

  return {
    name: pExportName,
    kind: 'component',
    source: pSourcePath,
    props: lProps,
    emits: parseEmits(pFilePath, lScriptContent),
    models: parseModels(pFilePath, lScriptContent),
    slots: parseSlots(pFilePath, lScriptContent),
    exposes: parseExposes(pFilePath, lScriptContent),
    cssTokens: lCssTokens,
    examples: pOptions.parseDocumentationAssets === false ? [] : parseExamples(pFilePath),
    snippets: pOptions.parseDocumentationAssets === false ? [] : parseSnippets(pFilePath),
  };
}
