import ts from 'typescript';

import type { IManifestModel } from '../../models/IManifest.model';

/**
 * @description Extrai models públicos declarados por defineModel no script do componente.
 * @param pComponentFilePath - Caminho absoluto do componente analisado.
 * @param pScriptContent - Conteúdo do script ou script setup do componente.
 * @returns Models normalizados para o manifesto.
 */
export function parseModels(pComponentFilePath: string, pScriptContent: string): IManifestModel[] {
  const lSourceFile = ts.createSourceFile(
    pComponentFilePath,
    pScriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const lModels: IManifestModel[] = [];

  function visit(pNode: ts.Node): void {
    if (
      !ts.isCallExpression(pNode) ||
      !ts.isIdentifier(pNode.expression) ||
      pNode.expression.text !== 'defineModel'
    ) {
      ts.forEachChild(pNode, visit);
      return;
    }

    const lNameArgument = pNode.arguments[0];
    const lOptionsArgument = ts.isStringLiteral(lNameArgument) ? pNode.arguments[1] : lNameArgument;
    const lOptions = ts.isObjectLiteralExpression(lOptionsArgument) ? lOptionsArgument : undefined;
    const lName = ts.isStringLiteral(lNameArgument) ? lNameArgument.text : 'modelValue';
    const lType = pNode.typeArguments?.[0]?.getText(lSourceFile) ?? 'unknown';
    const lRequired = getBooleanOption(lOptions, 'required') ?? false;

    lModels.push({
      name: lName,
      type: lType,
      required: lRequired,
      defaultValue: getOptionValue(lOptions, 'default'),
      updateEvent: `update:${lName}`,
    });
    ts.forEachChild(pNode, visit);
  }

  visit(lSourceFile);

  return lModels;
}

/**
 * @description Lê uma opção booleana estática de um objeto de options Vue.
 * @param pOptions - Objeto passado para a macro Vue.
 * @param pOptionName - Nome da opção desejada.
 * @returns Valor booleano quando declarado estaticamente.
 */
function getBooleanOption(
  pOptions: ts.ObjectLiteralExpression | undefined,
  pOptionName: string,
): boolean | undefined {
  const lValue = getOptionValueNode(pOptions, pOptionName);

  return lValue?.kind === ts.SyntaxKind.TrueKeyword
    ? true
    : lValue?.kind === ts.SyntaxKind.FalseKeyword
      ? false
      : undefined;
}

/**
 * @description Lê o texto de uma opção de um objeto de options Vue.
 * @param pOptions - Objeto passado para a macro Vue.
 * @param pOptionName - Nome da opção desejada.
 * @returns Texto da expressão da opção, quando presente.
 */
function getOptionValue(
  pOptions: ts.ObjectLiteralExpression | undefined,
  pOptionName: string,
): string | undefined {
  const lValue = getOptionValueNode(pOptions, pOptionName);

  return lValue?.getText();
}

/**
 * @description Localiza uma propriedade simples em um objeto literal.
 * @param pOptions - Objeto passado para a macro Vue.
 * @param pOptionName - Nome da propriedade desejada.
 * @returns Expressão declarada para a opção.
 */
function getOptionValueNode(
  pOptions: ts.ObjectLiteralExpression | undefined,
  pOptionName: string,
): ts.Expression | undefined {
  return pOptions?.properties.find(
    (pProperty): pProperty is ts.PropertyAssignment =>
      ts.isPropertyAssignment(pProperty) &&
      ts.isIdentifier(pProperty.name) &&
      pProperty.name.text === pOptionName,
  )?.initializer;
}
