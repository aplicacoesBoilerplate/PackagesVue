import { readFileSync } from 'node:fs';

import ts from 'typescript';

import type { IManifestExport } from '../../models/IManifest.model';

import { getManifestParameters } from './resolveTypeDeclaration';

/**
 * @description Extrai uma função pública TypeScript para documentação.
 * @param {string} pFilePath - Caminho absoluto do arquivo TypeScript analisado.
 * @param {string} pSourceName - Nome local da declaração exportada.
 * @param {string} pExportName - Nome público reexportado pelo package.
 * @param {string} pSourcePath - Caminho da declaração relativo ao package.
 * @returns {IManifestExport[]} API pública encontrada no arquivo.
 */
export function parseTypeScriptExport(
  pFilePath: string,
  pSourceName: string,
  pExportName: string,
  pSourcePath: string,
): IManifestExport[] {
  const lSource = readFileSync(pFilePath, 'utf8');
  const lSourceFile = ts.createSourceFile(
    pFilePath,
    lSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  return lSourceFile.statements.flatMap<IManifestExport>((pStatement) => {
    if (ts.isFunctionDeclaration(pStatement) && pStatement.name?.text === pSourceName) {
      return [
        {
          name: pExportName,
          kind: pExportName.startsWith('use') ? 'composable' : 'function',
          source: pSourcePath,
          parameters: getManifestParameters(pStatement.parameters, lSourceFile),
          returnType: pStatement.type?.getText(lSourceFile) ?? 'void',
        },
      ];
    }

    if (ts.isClassDeclaration(pStatement) && pStatement.name?.text === pSourceName) {
      return [
        {
          name: pExportName,
          kind: 'class',
          source: pSourcePath,
        },
      ];
    }

    if (ts.isInterfaceDeclaration(pStatement) && pStatement.name.text === pSourceName) {
      return [
        {
          name: pExportName,
          kind: 'interface',
          source: pSourcePath,
        },
      ];
    }

    if (ts.isTypeAliasDeclaration(pStatement) && pStatement.name.text === pSourceName) {
      return [
        {
          name: pExportName,
          kind: 'type',
          source: pSourcePath,
        },
      ];
    }

    if (!ts.isVariableStatement(pStatement)) {
      return [];
    }

    const lDeclaration = pStatement.declarationList.declarations.find(
      (pDeclaration) =>
        ts.isIdentifier(pDeclaration.name) && pDeclaration.name.text === pSourceName,
    );

    const lInitializer = lDeclaration?.initializer;

    if (
      !lDeclaration ||
      !lInitializer ||
      (!ts.isArrowFunction(lInitializer) && !ts.isFunctionExpression(lInitializer))
    ) {
      return [];
    }

    return [
      {
        name: pExportName,
        kind: pExportName.startsWith('use') ? 'composable' : 'function',
        source: pSourcePath,
        parameters: getManifestParameters(lInitializer.parameters, lSourceFile),
        returnType: lInitializer.type?.getText(lSourceFile) ?? 'void',
      },
    ];
  });
}
