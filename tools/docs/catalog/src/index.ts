import { fileURLToPath } from 'node:url';

import { CDocumentationCatalog } from './classes/CDocumentationCatalog.js';

/**
 * @description Executa a geração do catálogo a partir dos manifests UI do monorepo.
 */
function main(): void {
  const lWorkspaceRoot = fileURLToPath(new URL('../../../../', import.meta.url));
  const lCatalog = new CDocumentationCatalog(lWorkspaceRoot);

  lCatalog.generate();
  console.log('Catálogo de documentação gerado.');
}

main();
