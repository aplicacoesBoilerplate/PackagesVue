import type { IManifestExport, IManifestNavigation } from './IManifest.model';

/**
 * @description Declara um cenário Vue carregável pelo playground da documentação.
 *
 * @property {string} id - Identificador estável usado pelo manifesto e pelo loader.
 * @property {string} title - Título exibido para o cenário.
 * @property {string} source - Caminho relativo a src do arquivo Vue de exemplo.
 */
export interface IRegisteredPreview {
  id: string;
  title: string;
  source: string;
}

/**
 * @description Registro declarativo de uma API pública de package.
 *
 * O registro descreve somente intenção editorial e referências estáveis. O contrato
 * técnico continua sendo extraído da implementação pelo TypeScript e pelo compilador Vue.
 *
 * @property {string} id - Identificador estável da API.
 * @property {string} name - Nome público que será exportado pelo entry point.
 * @property {string} sourceName - Nome local da declaração ou default para componentes.
 * @property {string} source - Caminho relativo a src da implementação.
 * @property {IManifestExport['kind']} kind - Categoria declarada e validada contra a extração.
 * @property {boolean} [typeOnly] - Indica exportação exclusivamente de tipo.
 * @property {IManifestNavigation} navigation - Grupo e ordem da documentação.
 * @property {string} description - Descrição curta da responsabilidade pública.
 * @property {string[]} instructions - Instruções de uso exibidas no playground.
 * @property {IRegisteredPreview[]} [previews] - Cenários executáveis associados.
 * @property {string} [snippetsSource] - Caminho relativo a src do JSON de snippets.
 */
export interface IRegisteredArtifact<
  TKind extends IManifestExport['kind'] = IManifestExport['kind'],
> {
  id: string;
  name: string;
  sourceName: string;
  source: string;
  kind: TKind;
  typeOnly?: boolean;
  navigation: IManifestNavigation;
  description: string;
  instructions: string[];
  previews?: IRegisteredPreview[];
  snippetsSource?: string;
}
