import { existsSync, readFileSync } from 'node:fs';
import { dirname, parse, resolve } from 'node:path';

import type { IManifestExample } from '../../models/IManifest.model';

/**
 * @description Lê exemplos de documentação associados a um componente Vue.
 * @param {string} pComponentFilePath - Caminho absoluto do componente analisado.
 * @returns {IManifestExample[]} Exemplos vinculados ao componente.
 */
export function parseExamples(pComponentFilePath: string): IManifestExample[] {
  const lParsedPath = parse(pComponentFilePath);
  const lExamplesPath = resolve(dirname(pComponentFilePath), `${lParsedPath.name}.examples.vue`);

  if (!existsSync(lExamplesPath)) {
    return [];
  }

  return [
    {
      code: readFileSync(lExamplesPath, 'utf8'),
    },
  ];
}
