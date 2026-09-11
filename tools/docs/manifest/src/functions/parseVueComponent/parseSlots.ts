import ts from 'typescript';

import type { IManifestSlot } from '../../models/IManifest.model';

import {
  getManifestParameters,
  getPropertyName,
  getTypeMembers,
  resolveTypeDeclaration,
} from './resolveTypeDeclaration';

/**
 * @description Extrai slots públicos declarados por defineSlots no script do componente.
 * @param pComponentFilePath - Caminho absoluto do componente analisado.
 * @param pScriptContent - Conteúdo do script ou script setup do componente.
 * @returns Slots normalizados para o manifesto.
 */
export function parseSlots(pComponentFilePath: string, pScriptContent: string): IManifestSlot[] {
  const lSourceFile = ts.createSourceFile(
    pComponentFilePath,
    pScriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const lSlotsType = getSlotsType(lSourceFile);

  if (!lSlotsType) {
    return [];
  }

  const lResolvedSlots = ts.isTypeLiteralNode(lSlotsType)
    ? { sourceFile: lSourceFile, members: lSlotsType.members }
    : ts.isTypeReferenceNode(lSlotsType)
      ? resolveTypeDeclaration(
          pComponentFilePath,
          lSourceFile,
          lSlotsType.typeName.getText(lSourceFile),
        )
      : undefined;

  if (!lResolvedSlots) {
    throw new Error(`Não foi possível resolver o tipo de slots em ${pComponentFilePath}`);
  }

  const lMembers =
    'members' in lResolvedSlots
      ? lResolvedSlots.members
      : getTypeMembers(lResolvedSlots.declaration);

  if (!lMembers) {
    throw new Error(
      `O tipo de slots deve ser uma interface ou type literal em ${pComponentFilePath}`,
    );
  }

  return lMembers.flatMap((pMember) => getManifestSlot(pMember, lResolvedSlots.sourceFile));
}

/**
 * @description Localiza o argumento genérico da primeira chamada defineSlots.
 * @param pSourceFile - AST do script do componente.
 * @returns Tipo dos slots quando declarado de forma tipada.
 */
function getSlotsType(pSourceFile: ts.SourceFile): ts.TypeNode | undefined {
  let lSlotsType: ts.TypeNode | undefined;

  function visit(pNode: ts.Node): void {
    if (
      ts.isCallExpression(pNode) &&
      ts.isIdentifier(pNode.expression) &&
      pNode.expression.text === 'defineSlots' &&
      pNode.typeArguments?.[0]
    ) {
      lSlotsType = pNode.typeArguments[0];
    }

    ts.forEachChild(pNode, visit);
  }

  visit(pSourceFile);

  return lSlotsType;
}

/**
 * @description Converte um member TypeScript em contrato de slot.
 * @param pMember - Member do tipo usado por defineSlots.
 * @param pSourceFile - AST usada para preservar os textos dos tipos.
 * @returns Slot encontrado ou lista vazia quando o member não é uma assinatura de slot.
 */
function getManifestSlot(pMember: ts.TypeElement, pSourceFile: ts.SourceFile): IManifestSlot[] {
  if (ts.isMethodSignature(pMember) && pMember.name) {
    const lName = getPropertyName(pMember.name, pSourceFile);

    return lName
      ? [{ name: lName, parameters: getManifestParameters(pMember.parameters, pSourceFile) }]
      : [];
  }

  if (!ts.isPropertySignature(pMember) || !pMember.name || !pMember.type) {
    return [];
  }

  const lName = getPropertyName(pMember.name, pSourceFile);

  if (!lName || !ts.isFunctionTypeNode(pMember.type)) {
    return [];
  }

  return [{ name: lName, parameters: getManifestParameters(pMember.type.parameters, pSourceFile) }];
}
