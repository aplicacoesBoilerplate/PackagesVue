import { resolve } from 'node:path';

import { CManifest } from './classes/CManifest';

/**
 * @description Executa a geração de manifesto para um package informado.
 */
async function main(): Promise<void> {
  const lPackageDirectory = process.argv[2];

  if (!lPackageDirectory) {
    throw new Error(
      'Informe o diretório do package. Exemplo: npm run generate -- ../../../packages/ui/core',
    );
  }

  const lManifest = await CManifest.generate(resolve(lPackageDirectory));

  console.log(
    `Manifesto gerado para %s com %s export(s).`,
    lManifest.packageName,
    lManifest.exports.length,
  );
}

void main();
