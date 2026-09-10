import { existsSync, readFileSync } from 'node:fs';
import { dirname, parse, resolve } from 'node:path';

import type { IManifestExample } from '../../models/IManifest.model';

/**
 * @description Lê exemplos de documentação associados a um componente Vue.
 */
export function parseExamples(pComponentFilePath: string): IManifestExample[] {
  const parsedPath = parse(pComponentFilePath);
  const examplesPath = resolve(dirname(pComponentFilePath), `${parsedPath.name}.examples.vue`);

  if (!existsSync(examplesPath)) {
    return [];
  }

  return [
    {
      code: readFileSync(examplesPath, 'utf8'),
    },
  ];
}
