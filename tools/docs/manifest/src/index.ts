import { resolve } from 'node:path';

import { CManifest } from './classes/CManifest';

/**
 * @description Executa a geração de manifesto para um package informado.
 */
function main(): void {
  const packageDirectory = process.argv[2];

  if (!packageDirectory) {
    throw new Error(
      'Informe o diretório do package. Exemplo: npm run generate -- ../../../packages/ui/core',
    );
  }

  const manifest = CManifest.generate(resolve(packageDirectory));

  console.log(
    `Manifesto gerado para ${manifest.packageName} com ${manifest.exports.length} export(s).`,
  );
}

main();
