import { readFileSync } from 'node:fs';

import ts from 'typescript';

import type { IManifestExport } from '../../models/IManifest.model';

/**
 * @description Extrai uma função pública TypeScript para documentação.
 */
export function parseTypeScriptExport(
  pFilePath: string,
  pExportName: string,
  pSourcePath: string,
): IManifestExport[] {
  const source = readFileSync(pFilePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    pFilePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  return sourceFile.statements.flatMap<IManifestExport>((pStatement) => {
    if (ts.isFunctionDeclaration(pStatement) && pStatement.name?.text === pExportName) {
      return [
        {
          name: pExportName,
          kind: 'function',
          source: pSourcePath,
        },
      ];
    }

    if (ts.isClassDeclaration(pStatement) && pStatement.name?.text === pExportName) {
      return [
        {
          name: pExportName,
          kind: 'class',
          source: pSourcePath,
        },
      ];
    }

    return [];
  });
}
