import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import ts from 'typescript';

import type { IManifest, IManifestExport } from '../models/IManifest.model';

import { parseTypeScriptExport } from '../functions/parseVueComponent/parseTypeScriptExport';
import { parseVueComponent } from '../functions/parseVueComponent/parseVueComponent';
import { validateSnippets } from '../functions/validators/validateSnippets';

/**
 * @description Gera o manifesto de documentação a partir da API pública de um package.
 */
export class CManifest {
  /**
   * @description Gera e grava o manifesto de um package.
   * @param {string} pPackageDirectory - Diretório do package para gerar manifesto.
   * @returns Manifesto exportado
   */
  public static async generate(pPackageDirectory: string): Promise<IManifest> {
    const lPackagePath = resolve(pPackageDirectory, 'package.json');
    const lPackageJson = JSON.parse(readFileSync(lPackagePath, 'utf8')) as { name: string };
    const lEntryPath = resolve(pPackageDirectory, 'src/index.ts');
    const lExports = this.parsePublicExports(pPackageDirectory, lEntryPath);

    const lManifest: IManifest = {
      schemaVersion: '1.1',
      packageName: lPackageJson.name,
      exports: lExports,
    };

    const lSnippetIds = new Set<string>();

    for (const lSnippetIteration of lManifest.exports.flatMap(
      (pExport) => pExport.snippets ?? [],
    )) {
      if (lSnippetIds.has(lSnippetIteration.id)) {
        throw new Error(`Snippet duplicado: ${lSnippetIteration.id}`);
      }

      lSnippetIds.add(lSnippetIteration.id);
    }

    const lSnippetList = lManifest.exports.flatMap((pExport) => pExport.snippets ?? []);
    const lSnippets = Object.fromEntries(
      lSnippetList.map(({ id: pId, ...pSnippet }) => [pId, pSnippet]),
    );

    const lOutputPath = resolve(pPackageDirectory, 'dist/docs.manifest.json');
    const lSnippetsOutputPath = resolve(pPackageDirectory, 'dist/snippets.json');
    const lEslintConfigPath = this.getEslintConfigPath(pPackageDirectory);

    await validateSnippets(lSnippetList, lEslintConfigPath);

    mkdirSync(dirname(lOutputPath), { recursive: true });
    writeFileSync(lOutputPath, `${JSON.stringify(lManifest, null, 2)}\n`, 'utf8');
    writeFileSync(lSnippetsOutputPath, `${JSON.stringify(lSnippets, null, 2)}\n`, 'utf8');

    return lManifest;
  }

  /**
   * @description Resolve APIs reexportadas pelo entry point público.
   * @param {string} pPackageDirectory - Diretório do package.
   * @param {string} pEntryPath - Arquivo fonte para o parse.
   * @returns Body com os objetos do export do manifesto.
   */
  private static parsePublicExports(
    pPackageDirectory: string,
    pEntryPath: string,
  ): IManifestExport[] {
    const lSource = readFileSync(pEntryPath, 'utf8');
    const lSourceFile = ts.createSourceFile(
      pEntryPath,
      lSource,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    return lSourceFile.statements.flatMap<IManifestExport>((pStatement) => {
      if (
        !ts.isExportDeclaration(pStatement) ||
        !pStatement.moduleSpecifier ||
        !ts.isStringLiteral(pStatement.moduleSpecifier) ||
        !pStatement.exportClause ||
        !ts.isNamedExports(pStatement.exportClause)
      ) {
        return [];
      }

      const lModuleSpecifier = pStatement.moduleSpecifier.text;
      const lModulePath = resolve(dirname(pEntryPath), lModuleSpecifier);
      const lSourcePath = relative(pPackageDirectory, lModulePath).replaceAll('\\', '/');

      return pStatement.exportClause.elements.flatMap<IManifestExport>((pElement) => {
        const lExportName = pElement.name.text;
        const lSourceName = pElement.propertyName?.text ?? lExportName;

        if (lModuleSpecifier.endsWith('.vue')) {
          return [parseVueComponent(lModulePath, lExportName, lSourcePath)];
        }

        return parseTypeScriptExport(
          `${lModulePath}.ts`,
          lSourceName,
          lExportName,
          `${lSourcePath}.ts`,
        );
      });
    });
  }

  /**
   * @description Localiza a configuração ESLint a partir do diretório do package.
   *
   * @param pPackageDirectory - Diretório absoluto do package que está sendo processado.
   * @returns Caminho absoluto da configuração ESLint do repositório.
   * @throws Quando nenhuma configuração ESLint for encontrada até a raiz do disco.
   */
  private static getEslintConfigPath(pPackageDirectory: string): string {
    let lDirectory = pPackageDirectory;

    while (true) {
      const lEslintConfigPath = resolve(lDirectory, 'config/eslint.config.js');

      if (existsSync(lEslintConfigPath)) {
        return lEslintConfigPath;
      }

      const lParentDirectory = dirname(lDirectory);

      if (lParentDirectory === lDirectory) {
        break;
      }

      lDirectory = lParentDirectory;
    }

    throw new Error(`Não foi possível localizar config/eslint.config.js para ${pPackageDirectory}`);
  }
}
