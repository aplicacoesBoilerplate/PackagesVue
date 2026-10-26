import { existsSync, readFileSync } from 'node:fs';
import { dirname, parse, resolve } from 'node:path';

import type { IManifestSnippet } from '../../models/IManifest.model';

type TSnippetDefinition = Omit<IManifestSnippet, 'id'>;

/**
 * @description Lê snippets VS Code associados a um componente Vue.
 * @param {string} pComponentFilePath - Caminho absoluto do componente analisado.
 * @returns {IManifestSnippet[]} Snippets válidos vinculados ao componente.
 */
export function parseSnippets(pComponentFilePath: string): IManifestSnippet[] {
  const lParsedPath = parse(pComponentFilePath);
  const lSnippetsPath = resolve(dirname(pComponentFilePath), `${lParsedPath.name}.snippets.json`);

  if (!existsSync(lSnippetsPath)) {
    return [];
  }

  return parseSnippetFile(lSnippetsPath);
}

/**
 * @description Lê um arquivo JSON de snippets declarado pelo registro de uma API pública.
 * @param {string} pSnippetsPath - Caminho absoluto do arquivo de snippets.
 * @returns Snippets válidos definidos no arquivo informado.
 * @throws Quando o arquivo não existe ou possui uma estrutura inválida.
 */
export function parseSnippetFile(pSnippetsPath: string): IManifestSnippet[] {
  if (!existsSync(pSnippetsPath)) {
    throw new Error(`Arquivo de snippets não encontrado: ${pSnippetsPath}`);
  }

  const lContent: unknown = JSON.parse(readFileSync(pSnippetsPath, 'utf8'));

  if (!isRecord(lContent)) {
    throw new Error(`O arquivo de snippets deve conter um objeto: ${pSnippetsPath}`);
  }

  return Object.entries(lContent).map(([pId, pSnippet]) => {
    if (!isSnippetDefinition(pSnippet)) {
      throw new Error(`Snippet inválido "${pId}" em ${pSnippetsPath}`);
    }

    return {
      id: pId,
      ...pSnippet,
    };
  });
}

function isRecord(pValue: unknown): pValue is Record<string, unknown> {
  return typeof pValue === 'object' && pValue !== null && !Array.isArray(pValue);
}

function isSnippetDefinition(pValue: unknown): pValue is TSnippetDefinition {
  if (!isRecord(pValue)) {
    return false;
  }

  return (
    Array.isArray(pValue.prefix) &&
    pValue.prefix.every((pPrefix) => typeof pPrefix === 'string') &&
    typeof pValue.description === 'string' &&
    typeof pValue.scope === 'string' &&
    Array.isArray(pValue.body) &&
    pValue.body.every((pLine) => typeof pLine === 'string')
  );
}
