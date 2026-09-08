import ts from 'typescript';

import type { IManifestProp } from '../../models/IManifest.model';

/**
 * @description Extrai props tipadas declaradas por defineProps e withDefaults.
 */
export function parseProps(pScriptContent: string): IManifestProp[] {
  const sourceFile = ts.createSourceFile(
    'component.ts',
    pScriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const propsInterfaceName = getPropsInterfaceName(sourceFile);
  const defaultValues = getDefaultValues(sourceFile);

  if (!propsInterfaceName) {
    return [];
  }

  const propsInterface = sourceFile.statements.find(
    (pStatement): pStatement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(pStatement) && pStatement.name.text === propsInterfaceName,
  );

  if (!propsInterface) {
    return [];
  }

  return propsInterface.members.flatMap((pMember) => {
    if (!ts.isPropertySignature(pMember) || !pMember.name || !pMember.type) {
      return [];
    }

    const name = pMember.name.getText(sourceFile);

    return [
      {
        name,
        type: pMember.type.getText(sourceFile),
        required: !pMember.questionToken,
        defaultValue: defaultValues.get(name),
      },
    ];
  });
}

/**
 * @description Localiza o tipo genérico informado em defineProps.
 */
function getPropsInterfaceName(pSourceFile: ts.SourceFile): string | undefined {
  let interfaceName: string | undefined;

  function visit(pNode: ts.Node): void {
    if (
      ts.isCallExpression(pNode) &&
      ts.isIdentifier(pNode.expression) &&
      pNode.expression.text === 'defineProps' &&
      pNode.typeArguments?.[0] &&
      ts.isTypeReferenceNode(pNode.typeArguments[0])
    ) {
      interfaceName = pNode.typeArguments[0].typeName.getText(pSourceFile);
    }

    ts.forEachChild(pNode, visit);
  }

  visit(pSourceFile);

  return interfaceName;
}

/**
 * @description Extrai valores passados para withDefaults.
 */
function getDefaultValues(pSourceFile: ts.SourceFile): Map<string, string> {
  const defaultValues = new Map<string, string>();

  function visit(pNode: ts.Node): void {
    if (
      ts.isCallExpression(pNode) &&
      ts.isIdentifier(pNode.expression) &&
      pNode.expression.text === 'withDefaults' &&
      pNode.arguments[1] &&
      ts.isObjectLiteralExpression(pNode.arguments[1])
    ) {
      for (const property of pNode.arguments[1].properties) {
        if (!ts.isPropertyAssignment(property)) {
          continue;
        }

        defaultValues.set(
          property.name.getText(pSourceFile),
          property.initializer.getText(pSourceFile),
        );
      }
    }

    ts.forEachChild(pNode, visit);
  }

  visit(pSourceFile);

  return defaultValues;
}
