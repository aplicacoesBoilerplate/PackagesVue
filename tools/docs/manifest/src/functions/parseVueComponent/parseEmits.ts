import ts from 'typescript';

import type { IManifestEmit, IManifestParameter } from '../../models/IManifest.model';

import {
  getManifestParameters,
  getPropertyName,
  getTypeMembers,
  resolveTypeDeclaration,
} from './resolveTypeDeclaration';

/**
 * @description Extrai eventos públicos declarados por defineEmits no script do componente.
 * @param pComponentFilePath - Caminho absoluto do componente analisado.
 * @param pScriptContent - Conteúdo do script ou script setup do componente.
 * @returns Eventos normalizados para o manifesto.
 */
export function parseEmits(pComponentFilePath: string, pScriptContent: string): IManifestEmit[] {
  const lSourceFile = ts.createSourceFile(
    pComponentFilePath,
    pScriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const lEmitsType = getEmitsType(lSourceFile);

  if (!lEmitsType) {
    return [];
  }

  const lResolvedEmits = ts.isTypeLiteralNode(lEmitsType)
    ? { sourceFile: lSourceFile, members: lEmitsType.members }
    : ts.isTypeReferenceNode(lEmitsType)
      ? resolveTypeDeclaration(
          pComponentFilePath,
          lSourceFile,
          lEmitsType.typeName.getText(lSourceFile),
        )
      : undefined;

  if (!lResolvedEmits) {
    throw new Error(`Não foi possível resolver o tipo de emits em ${pComponentFilePath}`);
  }

  const lMembers =
    'members' in lResolvedEmits
      ? lResolvedEmits.members
      : getTypeMembers(lResolvedEmits.declaration);

  if (!lMembers) {
    throw new Error(
      `O tipo de emits deve ser uma interface ou type literal em ${pComponentFilePath}`,
    );
  }

  const lTypeSourceFile = lResolvedEmits.sourceFile;

  return lMembers.flatMap((pMember) => {
    if (ts.isCallSignatureDeclaration(pMember)) {
      return getCallSignatureEmit(pMember, lTypeSourceFile);
    }

    if (!ts.isPropertySignature(pMember) || !pMember.name || !pMember.type) {
      return [];
    }

    const lName = getPropertyName(pMember.name, lTypeSourceFile);

    if (!lName) {
      return [];
    }

    return [
      {
        name: lName,
        parameters: getEmitParameters(pMember.type, lTypeSourceFile),
      },
    ];
  });
}

/**
 * @description Localiza o argumento genérico da primeira chamada defineEmits.
 * @param pSourceFile - AST do script do componente.
 * @returns Tipo dos emits quando declarado de forma tipada.
 */
function getEmitsType(pSourceFile: ts.SourceFile): ts.TypeNode | undefined {
  let lEmitsType: ts.TypeNode | undefined;

  function visit(pNode: ts.Node): void {
    if (
      ts.isCallExpression(pNode) &&
      ts.isIdentifier(pNode.expression) &&
      pNode.expression.text === 'defineEmits' &&
      pNode.typeArguments?.[0]
    ) {
      lEmitsType = pNode.typeArguments[0];
    }

    ts.forEachChild(pNode, visit);
  }

  visit(pSourceFile);

  return lEmitsType;
}

/**
 * @description Converte a forma sobrecarregada de defineEmits em evento público.
 * @param pSignature - Assinatura de chamada do contrato de emits.
 * @param pSourceFile - AST usada para preservar os textos dos tipos.
 * @returns Evento encontrado ou lista vazia quando o nome não é literal.
 */
function getCallSignatureEmit(
  pSignature: ts.CallSignatureDeclaration,
  pSourceFile: ts.SourceFile,
): IManifestEmit[] {
  const lEventParameter = pSignature.parameters[0];

  if (!lEventParameter?.type || !ts.isLiteralTypeNode(lEventParameter.type)) {
    return [];
  }

  const lEventName = lEventParameter.type.literal;

  if (!ts.isStringLiteral(lEventName)) {
    return [];
  }

  return [
    {
      name: lEventName.text,
      parameters: getManifestParameters(pSignature.parameters.slice(1), pSourceFile),
    },
  ];
}

/**
 * @description Extrai payloads das formas tuple e function type de emits.
 * @param pType - Tipo associado ao nome do evento.
 * @param pSourceFile - AST usada para preservar os textos dos tipos.
 * @returns Payloads do evento.
 */
function getEmitParameters(pType: ts.TypeNode, pSourceFile: ts.SourceFile): IManifestParameter[] {
  if (ts.isFunctionTypeNode(pType)) {
    return getManifestParameters(pType.parameters, pSourceFile);
  }

  if (!ts.isTupleTypeNode(pType)) {
    return [];
  }

  return pType.elements.map((pElement, pIndex) => {
    const lElement = ts.isNamedTupleMember(pElement) ? pElement : undefined;

    return {
      name: lElement?.name.text ?? `arg${pIndex + 1}`,
      type: (lElement?.type ?? pElement).getText(pSourceFile),
      optional: Boolean(lElement?.questionToken),
    };
  });
}
