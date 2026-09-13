import ts from 'typescript';

import type {
  IManifestClassMember,
  IManifestExport,
  IManifestParameter,
  IManifestTypeParameter,
} from '../../models/IManifest.model';

/**
 * @description Extrai o contrato público de uma classe TypeScript sem instanciá-la.
 * @param {string} pFilePath - Caminho absoluto do arquivo TypeScript analisado.
 * @param {string} pSourceName - Nome local da classe exportada.
 * @param {string} pExportName - Nome público reexportado pelo package.
 * @param {string} pSourcePath - Caminho da declaração relativo ao package.
 * @param {'class' | 'service'} pKind - Categoria editorial declarada pelo registro.
 * @returns Contrato serializável da classe, quando encontrada.
 */
export function parseTypeScriptClass(
  pFilePath: string,
  pSourceName: string,
  pExportName: string,
  pSourcePath: string,
  pKind: 'class' | 'service',
): IManifestExport[] {
  const lProgram = ts.createProgram([pFilePath], {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
  });
  const lSourceFile = lProgram.getSourceFile(pFilePath);

  if (!lSourceFile) {
    return [];
  }

  const lDeclaration = lSourceFile.statements.find(
    (pStatement): pStatement is ts.ClassDeclaration =>
      ts.isClassDeclaration(pStatement) && pStatement.name?.text === pSourceName,
  );

  if (!lDeclaration) {
    return [];
  }

  const lChecker = lProgram.getTypeChecker();
  const lHeritage = getHeritage(lDeclaration, lSourceFile);

  return [
    {
      name: pExportName,
      kind: pKind,
      source: pSourcePath,
      abstract: hasModifier(lDeclaration, ts.SyntaxKind.AbstractKeyword),
      typeParameters: getTypeParameters(lDeclaration, lSourceFile),
      extends: lHeritage.extends,
      implements: lHeritage.implements,
      constructors: lDeclaration.members
        .filter((pMember): pMember is ts.ConstructorDeclaration =>
          ts.isConstructorDeclaration(pMember),
        )
        .filter(isPublicMember)
        .map((pConstructor) => ({
          parameters: getParameters(pConstructor.parameters, lChecker),
        })),
      members: lDeclaration.members.flatMap((pMember) =>
        getClassMember(pMember, lChecker, lSourceFile),
      ),
    },
  ];
}

/**
 * @param pDeclaration
 * @param pSourceFile
 * @description Extrai herança e contratos implementados por uma classe.
 */
function getHeritage(
  pDeclaration: ts.ClassDeclaration,
  pSourceFile: ts.SourceFile,
): Pick<IManifestExport, 'extends' | 'implements'> {
  const lExtends = pDeclaration.heritageClauses
    ?.find((pClause) => pClause.token === ts.SyntaxKind.ExtendsKeyword)
    ?.types[0]?.getText(pSourceFile);
  const lImplements = pDeclaration.heritageClauses
    ?.find((pClause) => pClause.token === ts.SyntaxKind.ImplementsKeyword)
    ?.types.map((pType) => pType.getText(pSourceFile));

  return {
    ...(lExtends ? { extends: lExtends } : {}),
    ...(lImplements && lImplements.length > 0 ? { implements: lImplements } : {}),
  };
}

/**
 * @param pDeclaration
 * @param pSourceFile
 * @description Extrai parâmetros genéricos preservando constraints e defaults declarados.
 */
function getTypeParameters(
  pDeclaration: ts.ClassDeclaration,
  pSourceFile: ts.SourceFile,
): IManifestTypeParameter[] | undefined {
  const lTypeParameters = pDeclaration.typeParameters?.map((pParameter) => ({
    name: pParameter.name.text,
    ...(pParameter.constraint ? { constraint: pParameter.constraint.getText(pSourceFile) } : {}),
    ...(pParameter.default ? { default: pParameter.default.getText(pSourceFile) } : {}),
  }));

  return lTypeParameters && lTypeParameters.length > 0 ? lTypeParameters : undefined;
}

/**
 * @param pMember
 * @param pChecker
 * @param pSourceFile
 * @description Converte um membro público suportado no contrato do manifesto.
 */
function getClassMember(
  pMember: ts.ClassElement,
  pChecker: ts.TypeChecker,
  pSourceFile: ts.SourceFile,
): IManifestClassMember[] {
  if (!isPublicMember(pMember) || ts.isConstructorDeclaration(pMember)) {
    return [];
  }

  if (ts.isMethodDeclaration(pMember) && pMember.name) {
    const lSignature = pChecker.getSignatureFromDeclaration(pMember);

    return [
      {
        name: getMemberName(pMember.name, pSourceFile),
        kind: 'method',
        static: hasModifier(pMember, ts.SyntaxKind.StaticKeyword),
        type: pChecker.typeToString(pChecker.getTypeAtLocation(pMember), pMember),
        parameters: getParameters(pMember.parameters, pChecker),
        returnType: lSignature
          ? pChecker.typeToString(pChecker.getReturnTypeOfSignature(lSignature), pMember)
          : 'void',
        abstract: hasModifier(pMember, ts.SyntaxKind.AbstractKeyword),
      },
    ];
  }

  if ((ts.isPropertyDeclaration(pMember) || ts.isGetAccessorDeclaration(pMember)) && pMember.name) {
    return [
      {
        name: getMemberName(pMember.name, pSourceFile),
        kind: 'property',
        static: hasModifier(pMember, ts.SyntaxKind.StaticKeyword),
        type: pChecker.typeToString(pChecker.getTypeAtLocation(pMember), pMember),
      },
    ];
  }

  return [];
}

/**
 * @param pParameters
 * @param pChecker
 * @description Converte parâmetros em tipos resolvidos pelo TypeChecker.
 */
function getParameters(
  pParameters: readonly ts.ParameterDeclaration[],
  pChecker: ts.TypeChecker,
): IManifestParameter[] {
  return pParameters.map((pParameter) => ({
    name: pParameter.name.getText(),
    type: pChecker.typeToString(pChecker.getTypeAtLocation(pParameter), pParameter),
    optional: Boolean(pParameter.questionToken || pParameter.initializer),
  }));
}

/**
 * @param pMember
 * @description Confirma se um membro é implicitamente ou explicitamente público.
 */
function isPublicMember(pMember: ts.Node): boolean {
  return (
    !hasModifier(pMember, ts.SyntaxKind.PrivateKeyword) &&
    !hasModifier(pMember, ts.SyntaxKind.ProtectedKeyword)
  );
}

/**
 * @param pNode
 * @param pKind
 * @description Confirma a presença de um modificador TypeScript.
 */
function hasModifier(pNode: ts.Node, pKind: ts.SyntaxKind): boolean {
  return (
    ts.getModifiers(pNode as ts.HasModifiers)?.some((pModifier) => pModifier.kind === pKind) ??
    false
  );
}

/**
 * @param pName
 * @param pSourceFile
 * @description Obtém o nome estático de um membro de classe.
 */
function getMemberName(pName: ts.PropertyName, pSourceFile: ts.SourceFile): string {
  return ts.isIdentifier(pName) || ts.isStringLiteral(pName) || ts.isNumericLiteral(pName)
    ? pName.text
    : pName.getText(pSourceFile);
}
