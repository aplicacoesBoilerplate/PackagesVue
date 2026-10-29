import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface IPackageDocumentation {
  name: string;
  version: string;
  slug: string;
  directory: string;
  peers: Record<string, string>;
}
export const REPOSITORY_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

export function readPackages(): IPackageDocumentation[] {
  const config = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'release-please-config.json'), 'utf8'));
  return Object.keys(config.packages).filter(directory => directory.startsWith('packages/')).map(directory => {
    const pkg = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, directory, 'package.json'), 'utf8'));
    if (pkg.private || typeof pkg.name !== 'string' || typeof pkg.version !== 'string') {
      throw new Error('Componente público sem identidade/versão: ' + directory);
    }
    return { name: pkg.name, version: pkg.version, slug: pkg.name.split('/').pop(),
      directory, peers: pkg.peerDependencies || {} };
  });
}
