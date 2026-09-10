/**
 * @description Representa a documentação gerada de um package público.
 * @property {string} schemaVersion - Versão do contrato do manifesto.
 * @property {string} packageName - Nome npm do package documentado.
 * @property {IManifestExport} exports - APIs públicas encontradas no entry point.
 */
export interface IManifest {
  schemaVersion: '1.0';
  packageName: string;
  exports: IManifestExport[];
}

/**
 * @description Representa uma API pública de um package.
 * @property {string} name - Nome público exportado.
 * @property {'class' | 'component' | 'composable' | 'function' | 'interface' | 'type'} kind - Categoria da API.
 * @property {string} source - Caminho do arquivo-fonte relativo ao package.
 * @property {IManifestProp[]} props - Props de componentes Vue.
 * @property {IManifestEvent[]} events - Eventos emitidos por componentes Vue.
 * @property {IManifestSlot[]} slots - Slots públicos de componentes Vue.
 * @property {IManifestCssToken[]} cssTokens - Tokens CSS encontrados nos estilos do componente.
 * @property {IManifestExample[]} examples - Vai ir para a documentação como um trecho de código copiável.
 * @property {IManifestSnippet[]} snippets - Disponibilizado para que as responsabilidades futuras da CLI importem snippets para projetos.
 */
export interface IManifestExport {
  name: string;
  kind: 'class' | 'component' | 'composable' | 'function' | 'interface' | 'type';
  source: string;
  props?: IManifestProp[];
  events?: IManifestEvent[];
  slots?: IManifestSlot[];
  cssTokens?: IManifestCssToken[];
  examples?: IManifestExample[];
  snippets?: IManifestSnippet[];
}

/**
 * @description Representa uma prop pública de componente.
 * @property {string} name - Nome da prop.
 * @property {string} type - Tipo TypeScript declarado.
 * @property {boolean} required - Indica se a prop é obrigatória.
 * @property {string} defaultValue - Valor padrão, quando definido.
 */
export interface IManifestProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * @description Representa um evento público emitido por componente.
 * @property {string} name - Nome do evento.
 * @property {string} payloadType - Tipo do payload emitido.
 */
export interface IManifestEvent {
  name: string;
  payloadType?: string;
}

/**
 * @description Representa um slot público de componente.
 * @property {string} name - Nome do slot.
 * @property {string} description - Descrição declarada pelo mantenedor.
 */
export interface IManifestSlot {
  name: string;
  description?: string;
}

/**
 * @description Representa um token CSS configurável pelo consumidor.
 * @property {`--${string}`} name - Nome da Custom Property CSS.
 * @property {string} defaultValue - Fallback aplicado pelo componente.
 * @property {string} description - Descrição opcional do token.
 */
export interface IManifestCssToken {
  name: `--${string}`;
  defaultValue?: string;
  description?: string;
}

/**
 * @description Interface para manifest gerar documentação legível e possível de ser copiada pelo usuário.
 * @property {string} code - O código do exemplo que será renderizado na documentação.
 */
export interface IManifestExample {
  code: string;
}

/**
 * @description Interface para o manifest gerar um snippet de código de cada componente do package.
 * @property {string} id - Identificador do snippet.
 * @property {string[]} prefix - Semelhante ao identificador, prefixos servem para acionamento na IDE.
 * @property {string} description - Descrição do snippet, retratando qual o componente e suas responsabilidades.
 * @property {string} scope - Qual a linguagem o snippet está disponível.
 * @property {string[]} body - Conteúdo do snippet que a IDE vai preencher.
 */
export interface IManifestSnippet {
  id: string;
  prefix: string[];
  description: string;
  scope: string;
  body: string[];
}
