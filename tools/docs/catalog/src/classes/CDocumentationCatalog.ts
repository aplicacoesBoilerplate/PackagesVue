import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type {
  IManifest,
  IManifestCssToken,
  IManifestEmit,
  IManifestExample,
  IManifestExport,
  IManifestExpose,
  IManifestModel,
  IManifestParameter,
  IManifestProp,
  IManifestSlot,
  IManifestSnippet,
  TManifestExportKind,
} from '../models/IManifest.model.js';

const EXPORT_KINDS: readonly TManifestExportKind[] = [
  'class',
  'component',
  'composable',
  'function',
  'interface',
  'type',
];

/**
 * @description Gera páginas VitePress e a navegação do catálogo a partir dos manifests UI.
 */
export class CDocumentationCatalog {
  /**
   * @description Cria um catálogo usando os caminhos padrão do monorepo.
   * @param {string} pWorkspaceRoot - Diretório raiz do monorepo.
   */
  public constructor(private readonly pWorkspaceRoot: string) {}

  /**
   * @description Lê os manifests 1.1 e atualiza todas as saídas geradas do catálogo.
   */
  public generate(): void {
    const lManifests = this.readManifests();
    const lGeneratedDirectory = resolve(this.pWorkspaceRoot, 'apps/docs/generated');
    const lNavigationPath = resolve(
      this.pWorkspaceRoot,
      'apps/docs/.vitepress/generated/navigation.ts',
    );

    rmSync(lGeneratedDirectory, { recursive: true, force: true });
    mkdirSync(lGeneratedDirectory, { recursive: true });

    for (const lManifest of lManifests) {
      this.writeManifestPages(lGeneratedDirectory, lManifest);
    }

    writeFileSync(resolve(lGeneratedDirectory, 'index.md'), this.renderIndex(lManifests), 'utf8');
    mkdirSync(dirname(lNavigationPath), { recursive: true });
    writeFileSync(lNavigationPath, this.renderNavigation(lManifests), 'utf8');
  }

  /**
   * @description Lê todos os manifests publicados pelos packages UI.
   * @returns Manifests ordenados por nome de package.
   */
  private readManifests(): IManifest[] {
    const lUiDirectory = resolve(this.pWorkspaceRoot, 'packages/ui');

    return readdirSync(lUiDirectory, { withFileTypes: true })
      .filter((pEntry) => pEntry.isDirectory())
      .map((pEntry) => resolve(lUiDirectory, pEntry.name, 'dist/docs.manifest.json'))
      .filter((pManifestPath) => existsSync(pManifestPath))
      .map((pManifestPath) => this.readManifest(pManifestPath))
      .sort((pFirstManifest, pSecondManifest) =>
        this.compareText(pFirstManifest.packageName, pSecondManifest.packageName),
      );
  }

  /**
   * @description Valida e converte um arquivo JSON no schema 1.1 do manifesto.
   * @param {string} pManifestPath - Caminho absoluto do manifesto.
   * @returns Manifesto validado.
   */
  private readManifest(pManifestPath: string): IManifest {
    const lContent = JSON.parse(readFileSync(pManifestPath, 'utf8')) as unknown;

    if (!this.isManifest(lContent)) {
      throw new Error(`Manifesto inválido ou incompatível (schema 1.1): ${pManifestPath}`);
    }

    return lContent;
  }

  /**
   * @description Grava o índice de um package e as páginas de suas APIs exportadas.
   * @param {string} pGeneratedDirectory - Diretório de páginas geradas.
   * @param {IManifest} pManifest - Manifesto a ser documentado.
   */
  private writeManifestPages(pGeneratedDirectory: string, pManifest: IManifest): void {
    const lPackagePath = this.getPackagePath(pManifest.packageName);
    const lPackageDirectory = resolve(pGeneratedDirectory, lPackagePath);
    const lExports = [...pManifest.exports].sort((pFirstExport, pSecondExport) => {
      const lNameComparison = this.compareText(pFirstExport.name, pSecondExport.name);

      return lNameComparison === 0
        ? this.compareText(pFirstExport.kind, pSecondExport.kind)
        : lNameComparison;
    });
    const lPageNames = new Set<string>();

    mkdirSync(lPackageDirectory, { recursive: true });

    for (const lExport of lExports) {
      const lPageName = this.getExportPath(lExport.name);

      if (lPageNames.has(lPageName)) {
        throw new Error(`Exports geram a mesma página: ${pManifest.packageName}/${lPageName}`);
      }

      lPageNames.add(lPageName);
      writeFileSync(
        resolve(lPackageDirectory, `${lPageName}.md`),
        this.renderExportPage(pManifest, lExport),
        'utf8',
      );
    }

    writeFileSync(
      resolve(lPackageDirectory, 'index.md'),
      this.renderPackageIndex(pManifest, lExports),
      'utf8',
    );
  }

  /**
   * @description Renderiza a página de índice geral do catálogo.
   * @param {IManifest[]} pManifests - Manifests que compõem o catálogo.
   * @returns Conteúdo Markdown da página.
   */
  private renderIndex(pManifests: IManifest[]): string {
    const lLines = [
      '---',
      `title: ${this.renderYamlString('Catálogo de APIs')}`,
      '---',
      '',
      '# Catálogo de APIs',
      '',
    ];

    if (pManifests.length === 0) {
      lLines.push('Nenhum manifesto `docs.manifest.json` schema `1.1` foi encontrado.', '');
    } else {
      lLines.push('Packages UI documentados a partir de seus manifests públicos.', '');

      for (const lManifest of pManifests) {
        lLines.push(
          `- [${this.escapeMarkdown(lManifest.packageName)}](./${this.getPackagePath(lManifest.packageName)}/)`,
        );
      }

      lLines.push('');
    }

    return lLines.join('\n');
  }

  /**
   * @description Renderiza o índice das APIs de um package.
   * @param {IManifest} pManifest - Manifesto do package.
   * @param {IManifestExport[]} pExports - Exports já ordenados do package.
   * @returns Conteúdo Markdown da página.
   */
  private renderPackageIndex(pManifest: IManifest, pExports: IManifestExport[]): string {
    const lLines = [
      '---',
      `title: ${this.renderYamlString(pManifest.packageName)}`,
      '---',
      '',
      `# ${pManifest.packageName}`,
      '',
      '## APIs públicas',
      '',
    ];

    if (pExports.length === 0) {
      lLines.push('Nenhuma API pública foi declarada neste manifesto.', '');
    } else {
      for (const lExport of pExports) {
        lLines.push(
          `- [${this.escapeMarkdown(lExport.name)}](./${this.getExportPath(lExport.name)}) (${lExport.kind})`,
        );
      }

      lLines.push('');
    }

    return lLines.join('\n');
  }

  /**
   * @description Renderiza a página completa de uma API pública.
   * @param {IManifest} pManifest - Manifesto de origem da API.
   * @param {IManifestExport} pExport - API documentada.
   * @returns Conteúdo Markdown da API.
   */
  private renderExportPage(pManifest: IManifest, pExport: IManifestExport): string {
    const lLines = [
      '---',
      `title: ${this.renderYamlString(pExport.name)}`,
      '---',
      '',
      `# ${pExport.name}`,
      '',
      `**Categoria:** \`${pExport.kind}\``,
      '',
      `**Fonte:** \`${pExport.source}\``,
      '',
      '## Importação',
      '',
      this.renderCodeBlock(`import { ${pExport.name} } from '${pManifest.packageName}';`, 'ts'),
    ];

    if (pExport.parameters || pExport.returnType) {
      lLines.push(...this.renderSignature(pExport));
    }

    if (pExport.kind === 'component') {
      lLines.push(...this.renderComponentContract(pExport));
    }

    lLines.push(...this.renderExamples(pExport.examples));
    lLines.push(...this.renderSnippets(pExport.snippets));

    return `${lLines.join('\n').trimEnd()}\n`;
  }

  /**
   * @description Renderiza parâmetros e retorno de funções e composables.
   * @param {IManifestExport} pExport - API com assinatura documentada.
   * @returns Linhas Markdown da assinatura.
   */
  private renderSignature(pExport: IManifestExport): string[] {
    const lLines = ['## Assinatura', ''];
    const lParameters = this.formatParameters(pExport.parameters ?? []);
    const lReturnType = pExport.returnType ?? 'void';

    lLines.push(this.renderCodeBlock(`${pExport.name}(${lParameters}): ${lReturnType}`, 'ts'));

    if ((pExport.parameters?.length ?? 0) > 0) {
      lLines.push('### Parâmetros', '');
      lLines.push('| Nome | Tipo | Obrigatório |', '| --- | --- | --- |');

      for (const lParameter of pExport.parameters ?? []) {
        lLines.push(
          `| \`${this.escapeTable(lParameter.name)}\` | \`${this.escapeTable(lParameter.type)}\` | ${lParameter.optional ? 'Não' : 'Sim'} |`,
        );
      }

      lLines.push('');
    }

    return lLines;
  }

  /**
   * @description Renderiza as seções de contrato exclusivas de componentes.
   * @param {IManifestExport} pExport - Componente documentado.
   * @returns Linhas Markdown do contrato do componente.
   */
  private renderComponentContract(pExport: IManifestExport): string[] {
    return [
      ...this.renderProps(pExport.props),
      ...this.renderEmits(pExport.emits),
      ...this.renderModels(pExport.models),
      ...this.renderSlots(pExport.slots),
      ...this.renderExposes(pExport.exposes),
      ...this.renderCssTokens(pExport.cssTokens),
    ];
  }

  /**
   * @description Renderiza a tabela de props quando declarada no manifesto.
   * @param {IManifestProp[] | undefined} pProps - Props do componente.
   * @returns Linhas Markdown da tabela.
   */
  private renderProps(pProps: IManifestProp[] | undefined): string[] {
    if (!pProps || pProps.length === 0) {
      return [];
    }

    const lLines = [
      '## Props',
      '',
      '| Nome | Tipo | Obrigatória | Padrão |',
      '| --- | --- | --- | --- |',
    ];

    for (const lProp of this.sortByName(pProps)) {
      lLines.push(
        `| \`${this.escapeTable(lProp.name)}\` | \`${this.escapeTable(lProp.type)}\` | ${lProp.required ? 'Sim' : 'Não'} | ${lProp.defaultValue ? `\`${this.escapeTable(lProp.defaultValue)}\`` : '-'} |`,
      );
    }

    return [...lLines, ''];
  }

  /**
   * @description Renderiza a tabela de eventos quando declarada no manifesto.
   * @param {IManifestEmit[] | undefined} pEmits - Eventos do componente.
   * @returns Linhas Markdown da tabela.
   */
  private renderEmits(pEmits: IManifestEmit[] | undefined): string[] {
    if (!pEmits || pEmits.length === 0) {
      return [];
    }

    const lLines = ['## Eventos', '', '| Evento | Payloads |', '| --- | --- |'];

    for (const lEmit of this.sortByName(pEmits)) {
      lLines.push(
        `| \`${this.escapeTable(lEmit.name)}\` | ${this.escapeTable(this.formatParameters(lEmit.parameters)) || '-'} |`,
      );
    }

    return [...lLines, ''];
  }

  /**
   * @description Renderiza a tabela de models quando declarada no manifesto.
   * @param {IManifestModel[] | undefined} pModels - Models do componente.
   * @returns Linhas Markdown da tabela.
   */
  private renderModels(pModels: IManifestModel[] | undefined): string[] {
    if (!pModels || pModels.length === 0) {
      return [];
    }

    const lLines = [
      '## Models',
      '',
      '| Nome | Tipo | Obrigatório | Evento | Padrão |',
      '| --- | --- | --- | --- | --- |',
    ];

    for (const lModel of this.sortByName(pModels)) {
      lLines.push(
        `| \`${this.escapeTable(lModel.name)}\` | \`${this.escapeTable(lModel.type)}\` | ${lModel.required ? 'Sim' : 'Não'} | \`${this.escapeTable(lModel.updateEvent)}\` | ${lModel.defaultValue ? `\`${this.escapeTable(lModel.defaultValue)}\`` : '-'} |`,
      );
    }

    return [...lLines, ''];
  }

  /**
   * @description Renderiza a tabela de slots quando declarada no manifesto.
   * @param {IManifestSlot[] | undefined} pSlots - Slots do componente.
   * @returns Linhas Markdown da tabela.
   */
  private renderSlots(pSlots: IManifestSlot[] | undefined): string[] {
    if (!pSlots || pSlots.length === 0) {
      return [];
    }

    const lLines = ['## Slots', '', '| Slot | Props disponibilizadas |', '| --- | --- |'];

    for (const lSlot of this.sortByName(pSlots)) {
      lLines.push(
        `| \`${this.escapeTable(lSlot.name)}\` | ${this.escapeTable(this.formatParameters(lSlot.parameters)) || '-'} |`,
      );
    }

    return [...lLines, ''];
  }

  /**
   * @description Renderiza a tabela de membros expostos quando declarada no manifesto.
   * @param {IManifestExpose[] | undefined} pExposes - Membros expostos pelo componente.
   * @returns Linhas Markdown da tabela.
   */
  private renderExposes(pExposes: IManifestExpose[] | undefined): string[] {
    if (!pExposes || pExposes.length === 0) {
      return [];
    }

    const lLines = [
      '## Exposes',
      '',
      '| Nome | Categoria | Tipo | Parâmetros | Retorno |',
      '| --- | --- | --- | --- | --- |',
    ];

    for (const lExpose of this.sortByName(pExposes)) {
      lLines.push(
        `| \`${this.escapeTable(lExpose.name)}\` | ${lExpose.kind} | \`${this.escapeTable(lExpose.type)}\` | ${this.escapeTable(this.formatParameters(lExpose.parameters ?? [])) || '-'} | ${lExpose.returnType ? `\`${this.escapeTable(lExpose.returnType)}\`` : '-'} |`,
      );
    }

    return [...lLines, ''];
  }

  /**
   * @description Renderiza a tabela de tokens CSS quando declarada no manifesto.
   * @param {IManifestCssToken[] | undefined} pCssTokens - Tokens CSS do componente.
   * @returns Linhas Markdown da tabela.
   */
  private renderCssTokens(pCssTokens: IManifestCssToken[] | undefined): string[] {
    if (!pCssTokens || pCssTokens.length === 0) {
      return [];
    }

    const lLines = ['## Tokens CSS', '', '| Token | Padrão | Descrição |', '| --- | --- | --- |'];

    for (const lToken of this.sortByName(pCssTokens)) {
      lLines.push(
        `| \`${this.escapeTable(lToken.name)}\` | ${lToken.defaultValue ? `\`${this.escapeTable(lToken.defaultValue)}\`` : '-'} | ${this.escapeTable(lToken.description ?? '') || '-'} |`,
      );
    }

    return [...lLines, ''];
  }

  /**
   * @description Renderiza os exemplos de uso de uma API.
   * @param {IManifestExample[] | undefined} pExamples - Exemplos declarados no manifesto.
   * @returns Linhas Markdown dos exemplos.
   */
  private renderExamples(pExamples: IManifestExample[] | undefined): string[] {
    if (!pExamples || pExamples.length === 0) {
      return [];
    }

    const lLines = ['## Exemplos', ''];

    for (const [lIndex, lExample] of pExamples.entries()) {
      lLines.push(`### Exemplo ${lIndex + 1}`, '', this.renderCodeBlock(lExample.code, 'vue'));
    }

    return lLines;
  }

  /**
   * @description Renderiza snippets de IDE de uma API.
   * @param {IManifestSnippet[] | undefined} pSnippets - Snippets declarados no manifesto.
   * @returns Linhas Markdown dos snippets.
   */
  private renderSnippets(pSnippets: IManifestSnippet[] | undefined): string[] {
    if (!pSnippets || pSnippets.length === 0) {
      return [];
    }

    const lLines = ['## Snippets', ''];

    for (const lSnippet of [...pSnippets].sort((pFirstSnippet, pSecondSnippet) =>
      this.compareText(pFirstSnippet.id, pSecondSnippet.id),
    )) {
      lLines.push(
        `### \`${lSnippet.id}\``,
        '',
        lSnippet.description,
        '',
        `**Prefixos:** ${lSnippet.prefix.map((pPrefix) => `\`${pPrefix}\``).join(', ')}`,
        '',
        this.renderCodeBlock(lSnippet.body.join('\n'), this.getSnippetLanguage(lSnippet.scope)),
      );
    }

    return lLines;
  }

  /**
   * @description Renderiza a configuração TypeScript de navegação do VitePress.
   * @param {IManifest[]} pManifests - Manifests que compõem o catálogo.
   * @returns Conteúdo TypeScript da navegação.
   */
  private renderNavigation(pManifests: IManifest[]): string {
    const lNavigationItems = [
      "  { text: 'Catálogo', link: '/generated/' },",
      ...pManifests.map(
        (pManifest) =>
          `  { text: '${this.escapeTypeScript(pManifest.packageName)}', link: '/generated/${this.getPackagePath(pManifest.packageName)}/' },`,
      ),
    ];
    const lSidebarEntries = pManifests.flatMap((pManifest) => {
      const lPackagePath = this.getPackagePath(pManifest.packageName);
      const lExports = [...pManifest.exports].sort((pFirstExport, pSecondExport) =>
        this.compareText(pFirstExport.name, pSecondExport.name),
      );
      const lItems = [
        `        { text: 'Visão geral', link: '/generated/${lPackagePath}/' },`,
        ...lExports.map(
          (pExport) =>
            `        { text: '${this.escapeTypeScript(pExport.name)}', link: '/generated/${lPackagePath}/${this.getExportPath(pExport.name)}' },`,
        ),
      ];

      return [
        `  '/generated/${lPackagePath}/': [`,
        '    {',
        `      text: '${this.escapeTypeScript(pManifest.packageName)}',`,
        '      items: [',
        ...lItems,
        '      ],',
        '    },',
        '  ],',
      ];
    });

    return [
      "import type { DefaultTheme } from 'vitepress';",
      '',
      '/** @description Navegação gerada automaticamente a partir dos manifests UI. */',
      'export const NAVIGATION: DefaultTheme.NavItem[] = [',
      ...lNavigationItems,
      '];',
      '',
      '/** @description Barra lateral gerada automaticamente a partir dos manifests UI. */',
      'export const SIDEBAR: DefaultTheme.Sidebar = {',
      ...lSidebarEntries,
      '};',
      '',
    ].join('\n');
  }

  /**
   * @description Formata parâmetros como uma assinatura TypeScript legível.
   * @param {IManifestParameter[]} pParameters - Parâmetros a formatar.
   * @returns Parâmetros separados por vírgula.
   */
  private formatParameters(pParameters: IManifestParameter[]): string {
    return pParameters
      .map(
        (pParameter) => `${pParameter.name}${pParameter.optional ? '?' : ''}: ${pParameter.type}`,
      )
      .join(', ');
  }

  /**
   * @description Determina uma linguagem de Markdown segura para o escopo do snippet.
   * @param {string} pScope - Escopo declarado pelo snippet.
   * @returns Linguagem de Markdown correspondente.
   */
  private getSnippetLanguage(pScope: string): string {
    const lLanguage = pScope.split(',')[0]?.trim().toLowerCase() ?? 'text';

    return /^[a-z0-9+-]+$/u.test(lLanguage) ? lLanguage : 'text';
  }

  /**
   * @description Renderiza um bloco de código sem permitir fechamento prematuro da cerca.
   * @param {string} pCode - Código a ser renderizado.
   * @param {string} pLanguage - Linguagem do bloco Markdown.
   * @returns Bloco de código Markdown.
   */
  private renderCodeBlock(pCode: string, pLanguage: string): string {
    const lFence = pCode.includes('```') ? '````' : '```';

    return `${lFence}${pLanguage}\n${pCode.trimEnd()}\n${lFence}\n`;
  }

  /**
   * @description Converte um nome de package em um segmento de URL previsível.
   * @param {string} pPackageName - Nome npm do package.
   * @returns Segmento de URL do package.
   */
  private getPackagePath(pPackageName: string): string {
    return this.toPathSegment(pPackageName.replace(/^@[^/]+\//u, ''));
  }

  /**
   * @description Converte o nome de um export em um segmento de URL previsível.
   * @param {string} pExportName - Nome público do export.
   * @returns Segmento de URL do export.
   */
  private getExportPath(pExportName: string): string {
    return this.toPathSegment(pExportName);
  }

  /**
   * @description Normaliza um identificador em kebab-case seguro para URLs.
   * @param {string} pValue - Identificador a normalizar.
   * @returns Segmento de URL normalizado.
   */
  private toPathSegment(pValue: string): string {
    const lValue = pValue
      .replace(/([a-z0-9])([A-Z])/gu, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/gu, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, '-')
      .replace(/^-+|-+$/gu, '');

    if (!lValue) {
      throw new Error(`Não foi possível gerar um caminho para: ${pValue}`);
    }

    return lValue;
  }

  /**
   * @description Escapa conteúdo textual usado em links Markdown.
   * @param {string} pValue - Texto a escapar.
   * @returns Texto Markdown seguro.
   */
  private escapeMarkdown(pValue: string): string {
    return pValue.replaceAll('[', '\\[').replaceAll(']', '\\]');
  }

  /**
   * @description Escapa conteúdo usado dentro de células de tabela Markdown.
   * @param {string} pValue - Texto a escapar.
   * @returns Texto seguro para tabela Markdown.
   */
  private escapeTable(pValue: string): string {
    return pValue.replace(/[|`\r\n]/gu, (pCharacter) => {
      if (pCharacter === '|') {
        return '\\|';
      }

      if (pCharacter === '`') {
        return '\\`';
      }

      return ' ';
    });
  }

  /**
   * @description Escapa textos interpolados em literais de string TypeScript.
   * @param {string} pValue - Texto a escapar.
   * @returns Texto seguro para literal delimitado por aspas simples.
   */
  private escapeTypeScript(pValue: string): string {
    return pValue.replace(/[\\']/gu, '\\$&');
  }

  /**
   * @description Serializa uma string para uso seguro no frontmatter YAML.
   * @param {string} pValue - Texto a serializar.
   * @returns Literal YAML delimitado por aspas duplas.
   */
  private renderYamlString(pValue: string): string {
    return JSON.stringify(pValue);
  }

  /**
   * @description Ordena itens que possuem o campo name sem alterar a coleção original.
   * @param {TItem[]} pItems - Itens a ordenar.
   * @returns Nova lista ordenada pelo campo name.
   */
  private sortByName<TItem extends { name: string }>(pItems: TItem[]): TItem[] {
    return [...pItems].sort((pFirstItem, pSecondItem) =>
      this.compareText(pFirstItem.name, pSecondItem.name),
    );
  }

  /**
   * @description Compara textos de forma estável e independente de localidade.
   * @param {string} pFirstValue - Primeiro texto.
   * @param {string} pSecondValue - Segundo texto.
   * @returns Número negativo, zero ou positivo conforme a ordenação.
   */
  private compareText(pFirstValue: string, pSecondValue: string): number {
    const lFirstValue = pFirstValue.toLowerCase();
    const lSecondValue = pSecondValue.toLowerCase();

    if (lFirstValue === lSecondValue) {
      return pFirstValue < pSecondValue ? -1 : pFirstValue > pSecondValue ? 1 : 0;
    }

    return lFirstValue < lSecondValue ? -1 : 1;
  }

  /**
   * @description Confirma se um valor segue o schema de manifesto 1.1.
   * @param {unknown} pValue - Valor desserializado do JSON.
   * @returns Indica se o valor é um manifesto válido.
   */
  private isManifest(pValue: unknown): pValue is IManifest {
    return (
      this.isRecord(pValue) &&
      pValue.schemaVersion === '1.1' &&
      this.isNonEmptyString(pValue.packageName) &&
      Array.isArray(pValue.exports) &&
      pValue.exports.every((pExport) => this.isManifestExport(pExport))
    );
  }

  /**
   * @description Confirma se um valor representa uma API pública válida.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor representa um export válido.
   */
  private isManifestExport(pValue: unknown): pValue is IManifestExport {
    if (
      !this.isRecord(pValue) ||
      !this.isNonEmptyString(pValue.name) ||
      !this.isManifestExportKind(pValue.kind) ||
      !this.isNonEmptyString(pValue.source)
    ) {
      return false;
    }

    return (
      this.isOptionalArray(pValue.props, (pProp) => this.isManifestProp(pProp)) &&
      this.isOptionalArray(pValue.emits, (pEmit) => this.isManifestEmit(pEmit)) &&
      this.isOptionalArray(pValue.models, (pModel) => this.isManifestModel(pModel)) &&
      this.isOptionalArray(pValue.slots, (pSlot) => this.isManifestSlot(pSlot)) &&
      this.isOptionalArray(pValue.exposes, (pExpose) => this.isManifestExpose(pExpose)) &&
      this.isOptionalArray(pValue.parameters, (pParameter) =>
        this.isManifestParameter(pParameter),
      ) &&
      this.isOptionalString(pValue.returnType) &&
      this.isOptionalArray(pValue.cssTokens, (pToken) => this.isManifestCssToken(pToken)) &&
      this.isOptionalArray(pValue.examples, (pExample) => this.isManifestExample(pExample)) &&
      this.isOptionalArray(pValue.snippets, (pSnippet) => this.isManifestSnippet(pSnippet))
    );
  }

  /**
   * @description Confirma se o valor pertence às categorias aceitas de export.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é uma categoria válida.
   */
  private isManifestExportKind(pValue: unknown): pValue is TManifestExportKind {
    return typeof pValue === 'string' && EXPORT_KINDS.includes(pValue as TManifestExportKind);
  }

  /**
   * @description Confirma se um valor representa uma prop válida.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é uma prop válida.
   */
  private isManifestProp(pValue: unknown): pValue is IManifestProp {
    return (
      this.isRecord(pValue) &&
      this.isNonEmptyString(pValue.name) &&
      this.isNonEmptyString(pValue.type) &&
      typeof pValue.required === 'boolean' &&
      this.isOptionalString(pValue.defaultValue)
    );
  }

  /**
   * @description Confirma se um valor representa um evento válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um evento válido.
   */
  private isManifestEmit(pValue: unknown): pValue is IManifestEmit {
    return (
      this.isRecord(pValue) &&
      this.isNonEmptyString(pValue.name) &&
      Array.isArray(pValue.parameters) &&
      pValue.parameters.every((pParameter) => this.isManifestParameter(pParameter))
    );
  }

  /**
   * @description Confirma se um valor representa um model válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um model válido.
   */
  private isManifestModel(pValue: unknown): pValue is IManifestModel {
    return (
      this.isRecord(pValue) &&
      this.isNonEmptyString(pValue.name) &&
      this.isNonEmptyString(pValue.type) &&
      typeof pValue.required === 'boolean' &&
      this.isOptionalString(pValue.defaultValue) &&
      this.isNonEmptyString(pValue.updateEvent)
    );
  }

  /**
   * @description Confirma se um valor representa um slot válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um slot válido.
   */
  private isManifestSlot(pValue: unknown): pValue is IManifestSlot {
    return (
      this.isRecord(pValue) &&
      this.isNonEmptyString(pValue.name) &&
      Array.isArray(pValue.parameters) &&
      pValue.parameters.every((pParameter) => this.isManifestParameter(pParameter))
    );
  }

  /**
   * @description Confirma se um valor representa um membro exposto válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um expose válido.
   */
  private isManifestExpose(pValue: unknown): pValue is IManifestExpose {
    return (
      this.isRecord(pValue) &&
      this.isNonEmptyString(pValue.name) &&
      (pValue.kind === 'method' || pValue.kind === 'property') &&
      this.isNonEmptyString(pValue.type) &&
      this.isOptionalArray(pValue.parameters, (pParameter) =>
        this.isManifestParameter(pParameter),
      ) &&
      this.isOptionalString(pValue.returnType)
    );
  }

  /**
   * @description Confirma se um valor representa um token CSS válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um token CSS válido.
   */
  private isManifestCssToken(pValue: unknown): pValue is IManifestCssToken {
    return (
      this.isRecord(pValue) &&
      typeof pValue.name === 'string' &&
      pValue.name.startsWith('--') &&
      this.isOptionalString(pValue.defaultValue) &&
      this.isOptionalString(pValue.description)
    );
  }

  /**
   * @description Confirma se um valor representa um exemplo válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um exemplo válido.
   */
  private isManifestExample(pValue: unknown): pValue is IManifestExample {
    return this.isRecord(pValue) && typeof pValue.code === 'string';
  }

  /**
   * @description Confirma se um valor representa um snippet válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um snippet válido.
   */
  private isManifestSnippet(pValue: unknown): pValue is IManifestSnippet {
    return (
      this.isRecord(pValue) &&
      this.isNonEmptyString(pValue.id) &&
      this.isStringArray(pValue.prefix) &&
      this.isNonEmptyString(pValue.description) &&
      this.isNonEmptyString(pValue.scope) &&
      this.isStringArray(pValue.body)
    );
  }

  /**
   * @description Confirma se um valor representa um parâmetro válido.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um parâmetro válido.
   */
  private isManifestParameter(pValue: unknown): pValue is IManifestParameter {
    return (
      this.isRecord(pValue) &&
      this.isNonEmptyString(pValue.name) &&
      this.isNonEmptyString(pValue.type) &&
      typeof pValue.optional === 'boolean'
    );
  }

  /**
   * @description Confirma se uma propriedade opcional é um array cujos itens atendem ao validador.
   * @param {unknown} pValue - Valor da propriedade opcional.
   * @param {(pItem: unknown) => boolean} pValidator - Validador de cada item.
   * @returns Indica se a propriedade está ausente ou é um array válido.
   */
  private isOptionalArray(pValue: unknown, pValidator: (pItem: unknown) => boolean): boolean {
    return pValue === undefined || (Array.isArray(pValue) && pValue.every(pValidator));
  }

  /**
   * @description Confirma se uma propriedade opcional é uma string.
   * @param {unknown} pValue - Valor da propriedade opcional.
   * @returns Indica se a propriedade está ausente ou é uma string.
   */
  private isOptionalString(pValue: unknown): boolean {
    return pValue === undefined || typeof pValue === 'string';
  }

  /**
   * @description Confirma se um valor é uma string não vazia.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é uma string não vazia.
   */
  private isNonEmptyString(pValue: unknown): pValue is string {
    return typeof pValue === 'string' && pValue.length > 0;
  }

  /**
   * @description Confirma se um valor é um objeto simples.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um objeto simples.
   */
  private isRecord(pValue: unknown): pValue is Record<string, unknown> {
    return typeof pValue === 'object' && pValue !== null && !Array.isArray(pValue);
  }

  /**
   * @description Confirma se um valor é um array composto exclusivamente por strings.
   * @param {unknown} pValue - Valor a validar.
   * @returns Indica se o valor é um array de strings.
   */
  private isStringArray(pValue: unknown): pValue is string[] {
    return Array.isArray(pValue) && pValue.every((pItem) => typeof pItem === 'string');
  }
}
