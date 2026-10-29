import ts from 'typescript';

import type { IManifestProp } from '../../models/IManifest.model';

import { getPropertyName, getTypeMembers, resolveTypeDeclaration } from './resolveTypeDeclaration';

/**
 * @description Extrai props públicas declaradas com defineProps em um componente Vue.
 *
 * A função constrói uma AST transitória do conteúdo script, identifica o tipo
 * usado por defineProps, resolve interfaces locais ou imports relativos e associa
 * valores definidos por withDefaults às respectivas props.
 *
 * @param pComponentFilePath - Caminho absoluto do arquivo Vue analisado.
 * @param pScriptContent - Conteúdo de script ou script setup extraído do SFC.
 * @returns Props normalizadas para inclusão no manifesto.
 * @throws Quando defineProps referencia uma interface que não pode ser resolvida.
 */
export function parseProps(pComponentFilePath: string, pScriptContent: string): IManifestProp[] {
  // Cria uma AST em memória; não lê, grava ou modifica arquivos no disco.
  const lComponentSourceFile = ts.createSourceFile(
    pComponentFilePath,
    pScriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const lPropsType = getPropsType(lComponentSourceFile);

  if (!lPropsType) {
    return [];
  }

  const lResolvedProps = ts.isTypeLiteralNode(lPropsType)
    ? { sourceFile: lComponentSourceFile, members: lPropsType.members }
    : ts.isTypeReferenceNode(lPropsType)
      ? resolveTypeDeclaration(
          pComponentFilePath,
          lComponentSourceFile,
          lPropsType.typeName.getText(lComponentSourceFile),
        )
      : undefined;

  if (!lResolvedProps) {
    throw new Error(`Não foi possível resolver o tipo de props em ${pComponentFilePath}`);
  }

  const lMembers =
    'members' in lResolvedProps
      ? lResolvedProps.members
      : getTypeMembers(lResolvedProps.declaration);

  if (!lMembers) {
    throw new Error(
      `O tipo de props deve ser uma interface ou type literal em ${pComponentFilePath}`,
    );
  }

  const lDefaultValues = getDefaultValues(lComponentSourceFile);

  return getManifestProps(
    'declaration' in lResolvedProps ? lResolvedProps.sourceFile : lComponentSourceFile,
    lMembers,
    lDefaultValues,
  );
}

/**
 * @description Converte members de uma interface TypeScript em props públicas
 * do manifesto.
 *
 * A AST da interface é usada para preservar a representação textual dos tipos.
 * Defaults não pertencem à interface: eles são recebidos separadamente porque
 * foram declarados pelo componente com withDefaults.
 *
 * @param pSourceFile - AST que contém a declaração da interface.
 * @param pMembers - Members do tipo de props resolvido localmente ou por import.
 * @param pDefaultValues - Valores padrão extraídos de withDefaults.
 * @returns Props compatíveis com o contrato IManifestProp.
 */
function getManifestProps(
  pSourceFile: ts.SourceFile,
  pMembers: ts.NodeArray<ts.TypeElement>,
  pDefaultValues: Map<string, string>,
): IManifestProp[] {
  return pMembers.flatMap((pMember) => {
    if (!ts.isPropertySignature(pMember) || !pMember.name || !pMember.type) {
      return [];
    }

    const lName = getPropertyName(pMember.name, pSourceFile);

    if (!lName) {
      return [];
    }

    const lDefaultValue = pDefaultValues.get(lName);

    return [
      {
        name: lName,
        type: pMember.type.getText(pSourceFile),
        required: !pMember.questionToken,
        ...(lDefaultValue === undefined
          ? {}
          : {
              defaultValue: lDefaultValue,
            }),
      },
    ];
  });
}

/**
 * @description Localiza o tipo genérico fornecido a defineProps<T>().
 *
 * A versão atual suporta referências diretas, como
 * defineProps<IBaseOverlayProps>(). Types inline, unions e interseções ainda
 * não são interpretados como uma lista de props.
 *
 * @param pSourceFile - AST do script do componente.
 * @returns Nó de tipo declarado ou undefined quando defineProps não usa generics.
 */
function getPropsType(pSourceFile: ts.SourceFile): ts.TypeNode | undefined {
  let lPropsType: ts.TypeNode | undefined;

  function visit(pNode: ts.Node): void {
    if (
      ts.isCallExpression(pNode) &&
      ts.isIdentifier(pNode.expression) &&
      pNode.expression.text === 'defineProps' &&
      pNode.typeArguments?.[0]
    ) {
      lPropsType = pNode.typeArguments[0];
    }

    ts.forEachChild(pNode, visit);
  }

  visit(pSourceFile);

  return lPropsType;
}

/**
 * @description Extrai os valores declarados no segundo argumento de withDefaults.
 *
 * Os valores são mapeados pelo nome da prop e aplicados posteriormente, inclusive
 * quando a interface de props foi importada de outro arquivo.
 *
 * @param pSourceFile - AST do script do componente.
 * @returns Mapa que relaciona cada prop ao texto de seu valor padrão.
 */
function getDefaultValues(pSourceFile: ts.SourceFile): Map<string, string> {
  const lDefaultValues = new Map<string, string>();

  function visit(pNode: ts.Node): void {
    if (
      ts.isCallExpression(pNode) &&
      ts.isIdentifier(pNode.expression) &&
      pNode.expression.text === 'withDefaults' &&
      pNode.arguments[1] &&
      ts.isObjectLiteralExpression(pNode.arguments[1])
    ) {
      for (const lProperty of pNode.arguments[1].properties) {
        if (!ts.isPropertyAssignment(lProperty)) {
          continue;
        }

        lDefaultValues.set(
          lProperty.name.getText(pSourceFile),
          lProperty.initializer.getText(pSourceFile),
        );
      }
    }

    ts.forEachChild(pNode, visit);
  }

  visit(pSourceFile);

  return lDefaultValues;
}
