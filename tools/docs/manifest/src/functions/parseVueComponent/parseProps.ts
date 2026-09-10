import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import ts from 'typescript';

import type { IManifestProp } from '../../models/IManifest.model';

/**
 * @description Representa uma interface de props junto ao arquivo TypeScript
 * que a declarou.
 *
 * A AST do arquivo é necessária para preservar os textos originais dos tipos
 * ao transformar cada propriedade em uma prop do manifesto.
 */
interface IResolvedPropsInterface {
  sourceFile: ts.SourceFile;
  declaration: ts.InterfaceDeclaration;
}

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
  const componentSourceFile = ts.createSourceFile(
    pComponentFilePath,
    pScriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  // Extrai o nome da interface localizada pelo arquivo do componente.
  const propsInterfaceName = getPropsInterfaceName(componentSourceFile);
  if (!propsInterfaceName) {
    return [];
  }

  // Extrai as props pelo arquivo do componente e o nome da interface.
  const propsInterface = getInterfaceDeclaration(componentSourceFile, propsInterfaceName);

  const resolvedPropsInterface = propsInterface
    ? {
        sourceFile: componentSourceFile,
        declaration: propsInterface,
      }
    : getImportedInterfaceDeclaration(pComponentFilePath, componentSourceFile, propsInterfaceName);

  if (!resolvedPropsInterface) {
    throw new Error(
      `Não foi possível resolver a interface de props "${propsInterfaceName}" em ${pComponentFilePath}`,
    );
  }

  const defaultValues = getDefaultValues(componentSourceFile);

  return getManifestProps(
    resolvedPropsInterface.sourceFile,
    resolvedPropsInterface.declaration,
    defaultValues,
  );
}

/**
 * @description Procura uma interface TypeScript declarada no mesmo script
 * que contém a chamada defineProps.
 *
 * @param pSourceFile - AST transitória do script do componente.
 * @param pInterfaceName - Nome da interface referenciada por defineProps.
 * @returns Declaração local da interface, quando encontrada.
 */
function getInterfaceDeclaration(
  pSourceFile: ts.SourceFile,
  pInterfaceName: string,
): ts.InterfaceDeclaration | undefined {
  return pSourceFile.statements.find(
    (pStatement): pStatement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(pStatement) && pStatement.name.text === pInterfaceName,
  );
}

/**
 * @description Resolve uma interface importada de um módulo TypeScript relativo.
 *
 * Suporta imports nomeados, como:
 * import type { IBaseOverlayProps } from './types/BaseOverlay.types';
 *
 * O caminho importado é resolvido a partir do diretório do componente e recebe
 * a extensão .ts, pois os imports TypeScript normalmente não declaram extensão.
 *
 * @param pComponentFilePath - Caminho absoluto do componente que declarou o import.
 * @param pComponentSourceFile - AST do script do componente.
 * @param pInterfaceName - Nome local da interface usada em defineProps.
 * @returns Arquivo TypeScript importado e a declaração da interface encontrada.
 * @throws Quando o módulo relativo ou a interface referenciada não existir.
 */
function getImportedInterfaceDeclaration(
  pComponentFilePath: string,
  pComponentSourceFile: ts.SourceFile,
  pInterfaceName: string,
): IResolvedPropsInterface | undefined {
  const importDeclaration = pComponentSourceFile.statements.find(
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
        (pElement) => pElement.name.text === pInterfaceName,
      );
    },
  );

  if (!importDeclaration || !ts.isStringLiteral(importDeclaration.moduleSpecifier)) {
    return undefined;
  }

  const importedFilePath = resolve(
    dirname(pComponentFilePath),
    `${importDeclaration.moduleSpecifier.text}.ts`,
  );

  if (!existsSync(importedFilePath)) {
    throw new Error(`Não foi possível localizar o tipo de props: ${importedFilePath}`);
  }

  const importedSourceFile = ts.createSourceFile(
    importedFilePath,
    readFileSync(importedFilePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const declaration = getInterfaceDeclaration(importedSourceFile, pInterfaceName);

  if (!declaration) {
    throw new Error(
      `Não foi possível localizar a interface "${pInterfaceName}" em ${importedFilePath}`,
    );
  }

  return {
    sourceFile: importedSourceFile,
    declaration,
  };
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
 * @param pInterface - Interface de props resolvida localmente ou por import.
 * @param pDefaultValues - Valores padrão extraídos de withDefaults.
 * @returns Props compatíveis com o contrato IManifestProp.
 */
function getManifestProps(
  pSourceFile: ts.SourceFile,
  pInterface: ts.InterfaceDeclaration,
  pDefaultValues: Map<string, string>,
): IManifestProp[] {
  return pInterface.members.flatMap((pMember) => {
    if (!ts.isPropertySignature(pMember) || !pMember.name || !pMember.type) {
      return [];
    }

    const name = pMember.name.getText(pSourceFile);

    return [
      {
        name,
        type: pMember.type.getText(pSourceFile),
        required: !pMember.questionToken,
        defaultValue: pDefaultValues.get(name),
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
 * @returns Nome da interface referenciada ou undefined quando defineProps não usa referência.
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
 * @description Extrai os valores declarados no segundo argumento de withDefaults.
 *
 * Os valores são mapeados pelo nome da prop e aplicados posteriormente, inclusive
 * quando a interface de props foi importada de outro arquivo.
 *
 * @param pSourceFile - AST do script do componente.
 * @returns Mapa que relaciona cada prop ao texto de seu valor padrão.
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
