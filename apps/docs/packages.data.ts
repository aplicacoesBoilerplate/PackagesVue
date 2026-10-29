import { execFileSync } from 'node:child_process';
import { readPackages, REPOSITORY_ROOT, type IPackageDocumentation } from './.vitepress/package-metadata';

interface IPackagesData { packages: IPackageDocumentation[]; sha: string }
declare const data: IPackagesData;
export { data };

export default {
  watch: ['../../release-please-config.json', '../../packages/**/package.json'],
  load(): IPackagesData {
    return { packages: readPackages(), sha: process.env.DOCS_SOURCE_SHA ||
      execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPOSITORY_ROOT, encoding: 'utf8' }).trim() };
  },
};
