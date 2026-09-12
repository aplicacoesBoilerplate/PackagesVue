import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import ts from 'typescript';

import type { IManifest, IManifestExport, IManifestPreview } from '../models/IManifest.model';
import type { IRegisteredArtifact, IRegisteredPreview } from '../models/IRegistry.model';

import { parseSnippetFile } from '../functions/parseVueComponent/parseSnippets';
import { parseTypeScriptExport } from '../functions/parseVueComponent/parseTypeScriptExport';
import { parseVueComponent } from '../functions/parseVueComponent/parseVueComponent';
import { validateSnippets } from '../functions/validators/validateSnippets';

/**
 * @description Gera o manifesto de documentação a partir da API pública de um package.
 */
export class CManifest {
  /**
   * @description Gera e grava o manifesto de um package.
   * @param {string} pPackageDirectory - Diretório do package para gerar manifesto.
   * @returns Manifesto exportado
   */
  public static async generate(pPackageDirectory: string): Promise<IManifest> {
    const lPackagePath = resolve(pPackageDirectory, 'package.json');
    const lPackageJson = JSON.parse(readFileSync(lPackagePath, 'utf8')) as { name: string };
    const lEntryPath = resolve(pPackageDirectory, 'src/index.ts');
    const lArtifacts = await this.getRegisteredArtifacts(pPackageDirectory);
    const lExports = lArtifacts
      ? this.parseRegisteredArtifacts(pPackageDirectory, lArtifacts)
      : this.parsePublicExports(pPackageDirectory, lEntryPath);

    const lManifest: IManifest = {
      schemaVersion: '1.1',
      packageName: lPackageJson.name,
      exports: lExports,
    };

    const lSnippetIds = new Set<string>();

    for (const lSnippetIteration of lManifest.exports.flatMap(
      (pExport) => pExport.snippets ?? [],
    )) {
      if (lSnippetIds.has(lSnippetIteration.id)) {
        throw new Error(`Snippet duplicado: ${lSnippetIteration.id}`);
      }

      lSnippetIds.add(lSnippetIteration.id);
    }

    const lSnippetList = lManifest.exports.flatMap((pExport) => pExport.snippets ?? []);
    const lSnippets = Object.fromEntries(
      lSnippetList.map(({ id: pId, ...pSnippet }) => [pId, pSnippet]),
    );

    const lOutputPath = resolve(pPackageDirectory, 'dist/docs.manifest.json');
    const lSnippetsOutputPath = resolve(pPackageDirectory, 'dist/snippets.json');
    const lEslintConfigPath = this.getEslintConfigPath(pPackageDirectory);

    await validateSnippets(lSnippetList, lEslintConfigPath);

    mkdirSync(dirname(lOutputPath), { recursive: true });
    writeFileSync(lOutputPath, `${JSON.stringify(lManifest, null, 2)}\n`, 'utf8');
    writeFileSync(lSnippetsOutputPath, `${JSON.stringify(lSnippets, null, 2)}\n`, 'utf8');

    return lManifest;
  }

  /**
   * @description Gera o entry point de um package a partir de seus registros, quando existirem.
   * @param {string} pPackageDirectory - Diretório do package que poderá ter registros.
   * @returns Indica se um entry point foi gerado.
   */
  public static async generateEntry(pPackageDirectory: string): Promise<boolean> {
    const lArtifacts = await this.getRegisteredArtifacts(pPackageDirectory);

    if (!lArtifacts) {
      return false;
    }

    this.writePublicEntry(resolve(pPackageDirectory, 'src/index.ts'), lArtifacts);
    this.writePreviewLoaders(pPackageDirectory, lArtifacts);
    return true;
  }

  /**
   * @description Resolve APIs reexportadas pelo entry point público.
   * @param {string} pPackageDirectory - Diretório do package.
   * @param {string} pEntryPath - Arquivo fonte para o parse.
   * @returns Body com os objetos do export do manifesto.
   */
  private static parsePublicExports(
    pPackageDirectory: string,
    pEntryPath: string,
  ): IManifestExport[] {
    const lSource = readFileSync(pEntryPath, 'utf8');
    const lSourceFile = ts.createSourceFile(
      pEntryPath,
      lSource,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    return lSourceFile.statements.flatMap<IManifestExport>((pStatement) => {
      if (
        !ts.isExportDeclaration(pStatement) ||
        !pStatement.moduleSpecifier ||
        !ts.isStringLiteral(pStatement.moduleSpecifier) ||
        !pStatement.exportClause ||
        !ts.isNamedExports(pStatement.exportClause)
      ) {
        return [];
      }

      const lModuleSpecifier = pStatement.moduleSpecifier.text;
      const lModulePath = resolve(dirname(pEntryPath), lModuleSpecifier);
      const lSourcePath = relative(pPackageDirectory, lModulePath).replaceAll('\\', '/');

      return pStatement.exportClause.elements.flatMap<IManifestExport>((pElement) => {
        const lExportName = pElement.name.text;
        const lSourceName = pElement.propertyName?.text ?? lExportName;

        if (lModuleSpecifier.endsWith('.vue')) {
          return [parseVueComponent(lModulePath, lExportName, lSourcePath)];
        }

        return parseTypeScriptExport(
          `${lModulePath}.ts`,
          lSourceName,
          lExportName,
          `${lSourcePath}.ts`,
        );
      });
    });
  }

  /**
   * @description Carrega o agregador de registros sem executar os artefatos registrados.
   * @param {string} pPackageDirectory - Diretório do package analisado.
   * @returns Artefatos declarados ou undefined quando o package ainda usa o fluxo legado.
   */
  private static async getRegisteredArtifacts(
    pPackageDirectory: string,
  ): Promise<IRegisteredArtifact[] | undefined> {
    const lRegisterPath = resolve(pPackageDirectory, 'src/docs/CPackageRegister.ts');

    if (!existsSync(lRegisterPath)) {
      return undefined;
    }

    const lModule: unknown = await import(pathToFileURL(lRegisterPath).href);

    if (!this.isPackageRegisterModule(lModule)) {
      throw new Error(`Registro inválido: ${lRegisterPath}`);
    }

    const lArtifacts = lModule.default.getArtifacts();
    this.validateRegisteredArtifacts(lArtifacts, lRegisterPath);
    return lArtifacts;
  }

  /**
   * @description Extrai contratos técnicos dos artefatos declarados no registro.
   * @param {string} pPackageDirectory - Diretório do package analisado.
   * @param {IRegisteredArtifact[]} pArtifacts - APIs públicas declaradas.
   * @returns APIs prontas para serialização no manifesto.
   */
  private static parseRegisteredArtifacts(
    pPackageDirectory: string,
    pArtifacts: IRegisteredArtifact[],
  ): IManifestExport[] {
    return pArtifacts.flatMap((pArtifact) => {
      const lFilePath = resolve(pPackageDirectory, 'src', pArtifact.source);
      const lSourcePath = `src/${pArtifact.source.replace(/^\.\//, '')}`;
      const lExtractedExports =
        pArtifact.kind === 'component'
          ? [
              parseVueComponent(lFilePath, pArtifact.name, lSourcePath, {
                parseDocumentationAssets: false,
              }),
            ]
          : parseTypeScriptExport(lFilePath, pArtifact.sourceName, pArtifact.name, lSourcePath);

      if (lExtractedExports.length !== 1) {
        throw new Error(`Não foi possível resolver o registro público: ${pArtifact.id}`);
      }

      const [lExtractedExport] = lExtractedExports;

      if (lExtractedExport.kind !== pArtifact.kind) {
        throw new Error(
          `Categoria divergente no registro ${pArtifact.id}: ${pArtifact.kind} != ${lExtractedExport.kind}`,
        );
      }

      const lPreviews = this.readPreviews(pPackageDirectory, pArtifact.previews ?? []);
      const lSnippets = this.readSnippets(pPackageDirectory, pArtifact);

      return [
        {
          ...lExtractedExport,
          id: pArtifact.id,
          navigation: pArtifact.navigation,
          description: pArtifact.description,
          instructions: pArtifact.instructions,
          examples: lPreviews.map(({ code: pCode }) => ({ code: pCode })),
          previews: lPreviews,
          snippets: lSnippets,
        },
      ];
    });
  }

  /**
   * @description Lê o código dos cenários declarados sem executá-los.
   * @param {string} pPackageDirectory - Diretório do package analisado.
   * @param {IRegisteredPreview[]} pPreviews - Referências declaradas para os cenários.
   * @returns Previews serializáveis no manifesto.
   */
  private static readPreviews(
    pPackageDirectory: string,
    pPreviews: IRegisteredPreview[],
  ): IManifestPreview[] {
    return pPreviews.map((pPreview) => {
      const lPreviewPath = resolve(pPackageDirectory, 'src', pPreview.source);

      if (!existsSync(lPreviewPath)) {
        throw new Error(`Preview não encontrado: ${pPreview.id}`);
      }

      return {
        id: pPreview.id,
        title: pPreview.title,
        code: readFileSync(lPreviewPath, 'utf8'),
      };
    });
  }

  /**
   * @description Lê os snippets declarados pelo registro sem acoplar o JSON à classe.
   * @param {string} pPackageDirectory - Diretório do package analisado.
   * @param {IRegisteredArtifact} pArtifact - API pública que pode declarar snippets.
   * @returns Snippets serializáveis no manifesto.
   */
  private static readSnippets(
    pPackageDirectory: string,
    pArtifact: IRegisteredArtifact,
  ): IManifestExport['snippets'] {
    if (!pArtifact.snippetsSource) {
      return [];
    }

    return parseSnippetFile(resolve(pPackageDirectory, 'src', pArtifact.snippetsSource));
  }

  /**
   * @description Grava exports estáticos para manter a API consumível por ESM e TypeScript.
   * @param {string} pEntryPath - Caminho do entry point público.
   * @param {IRegisteredArtifact[]} pArtifacts - APIs públicas declaradas.
   */
  private static writePublicEntry(pEntryPath: string, pArtifacts: IRegisteredArtifact[]): void {
    const lContent = pArtifacts
      .map((pArtifact) => {
        const lSpecifier =
          pArtifact.sourceName === 'default'
            ? `default as ${pArtifact.name}`
            : pArtifact.sourceName === pArtifact.name
              ? pArtifact.name
              : `${pArtifact.sourceName} as ${pArtifact.name}`;
        const lPrefix = pArtifact.typeOnly ? 'export type' : 'export';

        return `${lPrefix} { ${lSpecifier} } from '${pArtifact.source}';`;
      })
      .join('\n');

    this.writeFileIfChanged(pEntryPath, `${lContent}\n`);
  }

  /**
   * @description Grava o entry point que Vite compilará em loaders lazy de preview.
   * @param {string} pPackageDirectory - Diretório do package que contém os previews.
   * @param {IRegisteredArtifact[]} pArtifacts - APIs públicas declaradas.
   */
  private static writePreviewLoaders(
    pPackageDirectory: string,
    pArtifacts: IRegisteredArtifact[],
  ): void {
    const lOutputPath = resolve(pPackageDirectory, 'src/preview-loaders.generated.ts');

    this.writeFileIfChanged(lOutputPath, this.renderPreviewLoaders(pArtifacts));
  }

  /**
   * @description Atualiza um arquivo gerado somente quando seu conteúdo mudou.
   * @param {string} pFilePath - Caminho absoluto do arquivo gerado.
   * @param {string} pContent - Conteúdo completo que deverá ser persistido.
   */
  private static writeFileIfChanged(pFilePath: string, pContent: string): void {
    if (existsSync(pFilePath) && readFileSync(pFilePath, 'utf8') === pContent) {
      return;
    }

    writeFileSync(pFilePath, pContent, 'utf8');
  }

  /**
   * @description Cria imports lazy estáticos para previews, sem avaliar conteúdo do manifesto.
   * @param {IRegisteredArtifact[]} pArtifacts - APIs públicas declaradas.
   * @returns Módulo TypeScript consumível pela aplicação de documentação.
   */
  private static renderPreviewLoaders(pArtifacts: IRegisteredArtifact[]): string {
    const lPreviews = pArtifacts.flatMap((pArtifact) => pArtifact.previews ?? []);
    const lEntries = lPreviews.map(
      (pPreview) =>
        `PREVIEW_LOADERS[${this.renderStringLiteral(pPreview.id)}] = () =>\n  import(${this.renderStringLiteral(`./${pPreview.source.replace(/^\.\//, '')}`)});`,
    );

    return `export const PREVIEW_LOADERS: Record<string, () => Promise<unknown>> = {};\n\n${lEntries.join('\n')}\n`;
  }

  /**
   * @description Converte um valor em literal TypeScript com o padrão de aspas do repositório.
   * @param {string} pValue - Texto que será incorporado ao código gerado.
   * @returns Literal TypeScript com escapes seguros.
   */
  private static renderStringLiteral(pValue: string): string {
    const lEscapedValue = pValue
      .replaceAll('\\', '\\\\')
      .replaceAll("'", "\\'")
      .replaceAll('\n', '\\n')
      .replaceAll('\r', '\\r');

    return `'${lEscapedValue}'`;
  }

  /**
   * @description Valida a forma do módulo agregador carregado pelo gerador.
   * @param {unknown} pValue - Módulo carregado dinamicamente.
   * @returns Indica se o valor possui um agregador compatível.
   */
  private static isPackageRegisterModule(
    pValue: unknown,
  ): pValue is { default: { getArtifacts: () => IRegisteredArtifact[] } } {
    return (
      typeof pValue === 'object' &&
      pValue !== null &&
      'default' in pValue &&
      typeof pValue.default === 'function' &&
      'getArtifacts' in pValue.default &&
      typeof pValue.default.getArtifacts === 'function'
    );
  }

  /**
   * @description Valida identificadores e referências antes de gerar os artefatos públicos.
   * @param {IRegisteredArtifact[]} pArtifacts - APIs declaradas pelo package.
   * @param {string} pRegisterPath - Caminho usado nas mensagens de diagnóstico.
   */
  private static validateRegisteredArtifacts(
    pArtifacts: IRegisteredArtifact[],
    pRegisterPath: string,
  ): void {
    const lArtifactIds = new Set<string>();
    const lExportNames = new Set<string>();
    const lPreviewIds = new Set<string>();

    for (const lArtifact of pArtifacts) {
      if (lArtifactIds.has(lArtifact.id) || lExportNames.has(lArtifact.name)) {
        throw new Error(`Registro duplicado em ${pRegisterPath}: ${lArtifact.id}`);
      }

      if (!lArtifact.source.startsWith('./') || lArtifact.source.includes('..')) {
        throw new Error(`Caminho de registro inválido: ${lArtifact.source}`);
      }

      if (
        lArtifact.snippetsSource &&
        (!lArtifact.snippetsSource.startsWith('./') || lArtifact.snippetsSource.includes('..'))
      ) {
        throw new Error(`Caminho de snippets inválido: ${lArtifact.snippetsSource}`);
      }

      lArtifactIds.add(lArtifact.id);
      lExportNames.add(lArtifact.name);

      for (const lPreview of lArtifact.previews ?? []) {
        if (lPreviewIds.has(lPreview.id)) {
          throw new Error(`Preview duplicado em ${pRegisterPath}: ${lPreview.id}`);
        }

        if (!lPreview.source.startsWith('./') || lPreview.source.includes('..')) {
          throw new Error(`Caminho de preview inválido: ${lPreview.source}`);
        }

        lPreviewIds.add(lPreview.id);
      }
    }
  }

  /**
   * @description Localiza a configuração ESLint a partir do diretório do package.
   *
   * @param pPackageDirectory - Diretório absoluto do package que está sendo processado.
   * @returns Caminho absoluto da configuração ESLint do repositório.
   * @throws Quando nenhuma configuração ESLint for encontrada até a raiz do disco.
   */
  private static getEslintConfigPath(pPackageDirectory: string): string {
    let lDirectory = pPackageDirectory;

    while (true) {
      const lEslintConfigPath = resolve(lDirectory, 'config/eslint.config.js');

      if (existsSync(lEslintConfigPath)) {
        return lEslintConfigPath;
      }

      const lParentDirectory = dirname(lDirectory);

      if (lParentDirectory === lDirectory) {
        break;
      }

      lDirectory = lParentDirectory;
    }

    throw new Error(`Não foi possível localizar config/eslint.config.js para ${pPackageDirectory}`);
  }
}
