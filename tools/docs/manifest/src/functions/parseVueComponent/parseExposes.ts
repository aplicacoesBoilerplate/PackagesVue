import ts from 'typescript';

import type { IManifestExpose } from '../../models/IManifest.model';

import { getManifestParameters, getPropertyName } from './resolveTypeDeclaration';

/**
 * @description Extrai membros públicos declarados por defineExpose no script do componente.
 * @param pComponentFilePath - Caminho absoluto do componente analisado.
 * @param pScriptContent - Conteúdo do script ou script setup do componente.
 * @returns Membros expostos para template refs.
 */
export function parseExposes(
  pComponentFilePath: string,
  pScriptContent: string,
): IManifestExpose[] {
  const lSourceFile = ts.createSourceFile(
    pComponentFilePath,
    pScriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const lExposes: IManifestExpose[] = [];

  function visit(pNode: ts.Node): void {
    if (
      ts.isCallExpression(pNode) &&
      ts.isIdentifier(pNode.expression) &&
      pNode.expression.text === 'defineExpose' &&
      ts.isObjectLiteralExpression(pNode.arguments[0])
    ) {
      lExposes.push(
        ...pNode.arguments[0].properties.flatMap((pProperty) =>
          getManifestExpose(pProperty, lSourceFile),
        ),
      );
    }

    ts.forEachChild(pNode, visit);
  }

  visit(lSourceFile);

  return lExposes;
}

/**
 * @description Converte uma propriedade do defineExpose em contrato público.
 * @param pProperty - Propriedade do objeto passado a defineExpose.
 * @param pSourceFile - AST do script do componente.
 * @returns Membro exposto ou lista vazia para sintaxe dinâmica.
 */
function getManifestExpose(
  pProperty: ts.ObjectLiteralElementLike,
  pSourceFile: ts.SourceFile,
): IManifestExpose[] {
  if (ts.isMethodDeclaration(pProperty) && pProperty.name) {
    const lName = getPropertyName(pProperty.name, pSourceFile);

    return lName ? [getMethodExpose(lName, pProperty, pSourceFile)] : [];
  }

  if (ts.isPropertyAssignment(pProperty)) {
    const lName = getPropertyName(pProperty.name, pSourceFile);

    if (!lName) {
      return [];
    }

    if (
      ts.isArrowFunction(pProperty.initializer) ||
      ts.isFunctionExpression(pProperty.initializer)
    ) {
      return [getMethodExpose(lName, pProperty.initializer, pSourceFile)];
    }

    return [
      {
        name: lName,
        kind: 'property',
        type: pProperty.initializer.getText(pSourceFile),
      },
    ];
  }

  if (!ts.isShorthandPropertyAssignment(pProperty)) {
    return [];
  }

  return getDeclaredExpose(pProperty.name.text, pSourceFile);
}

/**
 * @description Resolve uma função ou variável exposta pela forma abreviada do objeto.
 * @param pName - Nome da variável ou função exposta.
 * @param pSourceFile - AST do script do componente.
 * @returns Membro exposto ou lista vazia quando não há declaração estática.
 */
function getDeclaredExpose(pName: string, pSourceFile: ts.SourceFile): IManifestExpose[] {
  for (const lStatement of pSourceFile.statements) {
    if (ts.isFunctionDeclaration(lStatement) && lStatement.name?.text === pName) {
      return [getMethodExpose(pName, lStatement, pSourceFile)];
    }

    if (!ts.isVariableStatement(lStatement)) {
      continue;
    }

    const lDeclaration = lStatement.declarationList.declarations.find(
      (pDeclaration) => ts.isIdentifier(pDeclaration.name) && pDeclaration.name.text === pName,
    );

    if (!lDeclaration) {
      continue;
    }

    const lInitializer = lDeclaration.initializer;

    if (
      lInitializer &&
      (ts.isArrowFunction(lInitializer) || ts.isFunctionExpression(lInitializer))
    ) {
      return [getMethodExpose(pName, lInitializer, pSourceFile)];
    }

    return [
      {
        name: pName,
        kind: 'property',
        type: lDeclaration.type?.getText(pSourceFile) ?? 'unknown',
      },
    ];
  }

  return [
    {
      name: pName,
      kind: 'property',
      type: 'unknown',
    },
  ];
}

/**
 * @description Converte uma assinatura executável em método exposto.
 * @param pName - Nome público do método.
 * @param pDeclaration - Declaração de função, método ou expressão de função.
 * @param pSourceFile - AST usada para preservar os textos dos tipos.
 * @returns Contrato de método exposto.
 */
function getMethodExpose(
  pName: string,
  pDeclaration: ts.SignatureDeclarationBase,
  pSourceFile: ts.SourceFile,
): IManifestExpose {
  const lParameters = getManifestParameters(pDeclaration.parameters, pSourceFile);
  const lReturnType = pDeclaration.type?.getText(pSourceFile) ?? 'void';

  return {
    name: pName,
    kind: 'method',
    type: `(${lParameters.map((pParameter) => `${pParameter.name}: ${pParameter.type}`).join(', ')}) => ${lReturnType}`,
    parameters: lParameters,
    returnType: lReturnType,
  };
}
