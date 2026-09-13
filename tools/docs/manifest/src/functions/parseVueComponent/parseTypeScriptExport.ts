import { readFileSync } from 'node:fs';

import ts from 'typescript';

import type { IManifestExport } from '../../models/IManifest.model';

import { parseTypeScriptClass } from './parseTypeScriptClass';
import { getManifestParameters } from './resolveTypeDeclaration';

/**
 * @description Extrai uma função pública TypeScript para documentação.
 * @param {string} pFilePath - Caminho absoluto do arquivo TypeScript analisado.
 * @param {string} pSourceName - Nome local da declaração exportada.
 * @param {string} pExportName - Nome público reexportado pelo package.
 * @param {string} pSourcePath - Caminho da declaração relativo ao package.
 * @param {IManifestExport['kind']} [pKind] - Categoria editorial declarada pelo registro.
 * @returns {IManifestExport[]} API pública encontrada no arquivo.
 */
export function parseTypeScriptExport(
  pFilePath: string,
  pSourceName: string,
  pExportName: string,
  pSourcePath: string,
  pKind?: IManifestExport['kind'],
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
          kind: getCallableKind(pExportName, pKind),
          source: pSourcePath,
          parameters: getManifestParameters(pStatement.parameters, lSourceFile),
          returnType: pStatement.type?.getText(lSourceFile) ?? 'void',
          typeParameters: getTypeParameters(pStatement, lSourceFile),
        },
      ];
    }

    if (ts.isClassDeclaration(pStatement) && pStatement.name?.text === pSourceName) {
      return parseTypeScriptClass(
        pFilePath,
        pSourceName,
        pExportName,
        pSourcePath,
        pKind === 'service' ? 'service' : 'class',
      );
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
        kind: getCallableKind(pExportName, pKind),
        source: pSourcePath,
        parameters: getManifestParameters(lInitializer.parameters, lSourceFile),
        returnType: lInitializer.type?.getText(lSourceFile) ?? 'void',
        typeParameters: getTypeParameters(lInitializer, lSourceFile),
      },
    ];
  });
}

/**
 * @description Resolve a categoria de uma API callable sem inferir registros declarativos.
 * @param {string} pExportName - Nome público da API callable.
 * @param {IManifestExport['kind']} [pKind] - Categoria declarada pelo registro.
 * @returns Categoria serializável da API.
 */
function getCallableKind(
  pExportName: string,
  pKind: IManifestExport['kind'] | undefined,
): 'composable' | 'function' {
  return pKind === 'composable' || (!pKind && pExportName.startsWith('use'))
    ? 'composable'
    : 'function';
}

/**
 * @description Extrai parâmetros genéricos declarados por uma função ou arrow function.
 * @param {ts.SignatureDeclarationBase} pDeclaration - Declaração callable analisada.
 * @param {ts.SourceFile} pSourceFile - Fonte usada para preservar os tipos declarados.
 * @returns Parâmetros genéricos serializáveis, quando existirem.
 */
function getTypeParameters(
  pDeclaration: ts.SignatureDeclarationBase,
  pSourceFile: ts.SourceFile,
): IManifestExport['typeParameters'] {
  const lTypeParameters = pDeclaration.typeParameters?.map((pParameter) => ({
    name: pParameter.name.text,
    ...(pParameter.constraint ? { constraint: pParameter.constraint.getText(pSourceFile) } : {}),
    ...(pParameter.default ? { default: pParameter.default.getText(pSourceFile) } : {}),
  }));

  return lTypeParameters && lTypeParameters.length > 0 ? lTypeParameters : undefined;
}
