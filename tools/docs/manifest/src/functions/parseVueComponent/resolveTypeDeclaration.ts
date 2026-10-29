import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import ts from 'typescript';

import type { IManifestParameter } from '../../models/IManifest.model';

export type TTypeDeclaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;

/**
 * @description Representa uma declaração TypeScript resolvida junto à AST de origem.
 */
export interface IResolvedTypeDeclaration {
  sourceFile: ts.SourceFile;
  declaration: TTypeDeclaration;
}

/**
 * @description Resolve uma interface ou type alias local ou importado por caminho relativo.
 * @param pComponentFilePath - Caminho absoluto do componente analisado.
 * @param pSourceFile - AST que referencia o tipo.
 * @param pTypeName - Nome local da referência de tipo.
 * @returns Declaração encontrada, quando o tipo puder ser resolvido.
 */
export function resolveTypeDeclaration(
  pComponentFilePath: string,
  pSourceFile: ts.SourceFile,
  pTypeName: string,
): IResolvedTypeDeclaration | undefined {
  const lLocalDeclaration = getTypeDeclaration(pSourceFile, pTypeName);

  if (lLocalDeclaration) {
    return {
      sourceFile: pSourceFile,
      declaration: lLocalDeclaration,
    };
  }

  const lImportDeclaration = pSourceFile.statements.find(
    (pStatement): pStatement is ts.ImportDeclaration => {
      if (
        !ts.isImportDeclaration(pStatement) ||
        !ts.isStringLiteral(pStatement.moduleSpecifier) ||
        !pStatement.importClause?.namedBindings ||
        !ts.isNamedImports(pStatement.importClause.namedBindings)
      ) {
        return false;
      }

      return pStatement.importClause.namedBindings.elements.some(
        (pElement) => pElement.name.text === pTypeName,
      );
    },
  );

  if (!lImportDeclaration || !ts.isStringLiteral(lImportDeclaration.moduleSpecifier)) {
    return undefined;
  }

  const lImportElement = lImportDeclaration.importClause?.namedBindings;
  const lImportedTypeName =
    lImportElement && ts.isNamedImports(lImportElement)
      ? (lImportElement.elements.find((pElement) => pElement.name.text === pTypeName)?.propertyName
          ?.text ?? pTypeName)
      : pTypeName;
  const lImportedFilePath = resolveTypeScriptFile(
    dirname(pComponentFilePath),
    lImportDeclaration.moduleSpecifier.text,
  );

  if (!lImportedFilePath) {
    throw new Error(
      `Não foi possível localizar o tipo "${pTypeName}" importado por ${pComponentFilePath}`,
    );
  }

  const lImportedSourceFile = ts.createSourceFile(
    lImportedFilePath,
    readFileSync(lImportedFilePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const lDeclaration = getTypeDeclaration(lImportedSourceFile, lImportedTypeName);

  if (!lDeclaration) {
    throw new Error(
      `Não foi possível localizar o tipo "${lImportedTypeName}" em ${lImportedFilePath}`,
    );
  }

  return {
    sourceFile: lImportedSourceFile,
    declaration: lDeclaration,
  };
}

/**
 * @description Obtém members de interfaces e type literals que representam contratos públicos.
 * @param pDeclaration - Declaração TypeScript resolvida.
 * @returns Members do contrato ou undefined para aliases não estruturais.
 */
export function getTypeMembers(
  pDeclaration: TTypeDeclaration,
): ts.NodeArray<ts.TypeElement> | undefined {
  if (ts.isInterfaceDeclaration(pDeclaration)) {
    return pDeclaration.members;
  }

  return ts.isTypeLiteralNode(pDeclaration.type) ? pDeclaration.type.members : undefined;
}

/**
 * @description Converte parâmetros de AST TypeScript em contrato reutilizável pelo manifesto.
 * @param pParameters - Parâmetros da assinatura pública.
 * @param pSourceFile - AST usada para preservar o texto dos tipos.
 * @returns Parâmetros normalizados.
 */
export function getManifestParameters(
  pParameters: readonly ts.ParameterDeclaration[],
  pSourceFile: ts.SourceFile,
): IManifestParameter[] {
  return pParameters.map((pParameter) => ({
    name: pParameter.name.getText(pSourceFile),
    type: pParameter.type?.getText(pSourceFile) ?? 'unknown',
    optional: Boolean(pParameter.questionToken || pParameter.initializer),
  }));
}

/**
 * @description Obtém o nome estático de uma propriedade TypeScript.
 * @param pName - Nome AST de propriedade.
 * @param pSourceFile - AST usada para preservar o texto original quando necessário.
 * @returns Nome sem aspas, quando estático.
 */
export function getPropertyName(
  pName: ts.PropertyName,
  pSourceFile: ts.SourceFile,
): string | undefined {
  if (ts.isIdentifier(pName) || ts.isStringLiteral(pName) || ts.isNumericLiteral(pName)) {
    return pName.text;
  }

  return ts.isComputedPropertyName(pName) ? undefined : pName.getText(pSourceFile);
}

/**
 * @description Localiza uma declaração de interface ou type alias pelo nome.
 * @param pSourceFile - AST que contém a declaração.
 * @param pTypeName - Nome a localizar.
 * @returns Declaração encontrada, quando existir.
 */
function getTypeDeclaration(
  pSourceFile: ts.SourceFile,
  pTypeName: string,
): TTypeDeclaration | undefined {
  return pSourceFile.statements.find(
    (pStatement): pStatement is TTypeDeclaration =>
      (ts.isInterfaceDeclaration(pStatement) || ts.isTypeAliasDeclaration(pStatement)) &&
      pStatement.name.text === pTypeName,
  );
}

/**
 * @description Resolve um módulo TypeScript relativo, com ou sem extensão explícita.
 * @param pDirectory - Diretório do arquivo que declarou o import.
 * @param pModuleSpecifier - Valor do módulo importado.
 * @returns Caminho de um arquivo TypeScript existente, quando encontrado.
 */
function resolveTypeScriptFile(pDirectory: string, pModuleSpecifier: string): string | undefined {
  if (!pModuleSpecifier.startsWith('.')) {
    return undefined;
  }

  const lBasePath = resolve(pDirectory, pModuleSpecifier);
  const lCandidates = [
    lBasePath,
    `${lBasePath}.ts`,
    `${lBasePath}.tsx`,
    `${lBasePath}.d.ts`,
    resolve(lBasePath, 'index.ts'),
  ];

  return lCandidates.find((pFilePath) => existsSync(pFilePath));
}
