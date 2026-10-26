import { resolve } from 'node:path';

import { CManifest } from './classes/CManifest';

/**
 * @description Executa a geração de manifesto para um package informado.
 */
async function main(): Promise<void> {
  const lArguments = process.argv.slice(2);
  const lGenerateEntry = lArguments.includes('--entry');
  const lPackageDirectory = lArguments.find((pArgument) => pArgument !== '--entry');

  if (!lPackageDirectory) {
    throw new Error(
      'Informe o diretório do package. Exemplo: npm run generate -- ../../../packages/ui/core',
    );
  }

  const lResolvedPackageDirectory = resolve(lPackageDirectory);

  if (lGenerateEntry) {
    const lGenerated = await CManifest.generateEntry(lResolvedPackageDirectory);

    console.log(
      lGenerated ? 'Entry point público gerado.' : 'Package sem registro; entry point preservado.',
    );
    return;
  }

  const lManifest = await CManifest.generate(lResolvedPackageDirectory);

  console.log(
    `Manifesto gerado para %s com %s export(s).`,
    lManifest.packageName,
    lManifest.exports.length,
  );
}

void main();
