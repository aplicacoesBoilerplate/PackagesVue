import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import ts from 'typescript';

import { parseTypeScriptExport } from '../functions/parseVueComponent/parseTypeScriptExport';
import { parseVueComponent } from '../functions/parseVueComponent/parseVueComponent';
import type { IManifest, IManifestExport } from '../models/IManifest.model';
import { validateSnippets } from '../functions/validators/validateSnippets';

/**
 * @description Gera o manifesto de documentação a partir da API pública de um package.
 */
export class CManifest {
  /**
   * @description Gera e grava o manifesto de um package.
   */
  public static async generate(pPackageDirectory: string): Promise<IManifest> {
    const packagePath = resolve(pPackageDirectory, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { name: string };
    const entryPath = resolve(pPackageDirectory, 'src/index.ts');
    const exports = this.parsePublicExports(pPackageDirectory, entryPath);

    const manifest: IManifest = {
      schemaVersion: '1.1',
      packageName: packageJson.name,
      exports,
    };

    const snippetIds = new Set<string>();

    for (const snippet of manifest.exports.flatMap((pExport) => pExport.snippets ?? [])) {
      if (snippetIds.has(snippet.id)) {
        throw new Error(`Snippet duplicado: ${snippet.id}`);
      }

      snippetIds.add(snippet.id);
    }

    const snippets = Object.fromEntries(
      manifest.exports
        .flatMap((pExport) => pExport.snippets ?? [])
        .map(({ id, ...pSnippet }) => [id, pSnippet]),
    );

    const outputPath = resolve(pPackageDirectory, 'dist/docs.manifest.json');
    const snippetsOutputPath = resolve(pPackageDirectory, 'dist/snippets.json');
    await validateSnippets(snippets, ESLINT_CONFIG_PATH);

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    writeFileSync(snippetsOutputPath, `${JSON.stringify(snippets, null, 2)}\n`, 'utf8');

    return manifest;
  }

  /**
   * @description Resolve APIs reexportadas pelo entry point público.
   */
  private static parsePublicExports(
    pPackageDirectory: string,
    pEntryPath: string,
  ): IManifestExport[] {
    const source = readFileSync(pEntryPath, 'utf8');
    const sourceFile = ts.createSourceFile(
      pEntryPath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    return sourceFile.statements.flatMap<IManifestExport>((pStatement) => {
      if (
        !ts.isExportDeclaration(pStatement) ||
        !pStatement.moduleSpecifier ||
        !ts.isStringLiteral(pStatement.moduleSpecifier) ||
        !pStatement.exportClause ||
        !ts.isNamedExports(pStatement.exportClause)
      ) {
        return [];
      }

      const moduleSpecifier = pStatement.moduleSpecifier.text;
      const modulePath = resolve(dirname(pEntryPath), moduleSpecifier);
      const sourcePath = relative(pPackageDirectory, modulePath).replaceAll('\\', '/');

      return pStatement.exportClause.elements.flatMap<IManifestExport>((pElement) => {
        const exportName = pElement.name.text;

        if (moduleSpecifier.endsWith('.vue')) {
          return [parseVueComponent(modulePath, exportName, sourcePath)];
        }

        return parseTypeScriptExport(`${modulePath}.ts`, exportName, `${sourcePath}.ts`);
      });
    });
  }
}
