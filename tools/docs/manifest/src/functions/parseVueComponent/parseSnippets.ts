import { existsSync, readFileSync } from 'node:fs';
import { dirname, parse, resolve } from 'node:path';

import type { IManifestSnippet } from '../../models/IManifest.model';

type TSnippetDefinition = Omit<IManifestSnippet, 'id'>;

/**
 * @description Lê snippets VS Code associados a um componente Vue.
 */
export function parseSnippets(pComponentFilePath: string): IManifestSnippet[] {
  const parsedPath = parse(pComponentFilePath);
  const snippetsPath = resolve(dirname(pComponentFilePath), `${parsedPath.name}.snippets.json`);

  if (!existsSync(snippetsPath)) {
    return [];
  }

  const content: unknown = JSON.parse(readFileSync(snippetsPath, 'utf8'));

  if (!isRecord(content)) {
    throw new Error(`O arquivo de snippets deve conter um objeto: ${snippetsPath}`);
  }

  return Object.entries(content).map(([pId, pSnippet]) => {
    if (!isSnippetDefinition(pSnippet)) {
      throw new Error(`Snippet inválido "${pId}" em ${snippetsPath}`);
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
