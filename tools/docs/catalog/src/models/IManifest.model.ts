/**
 * @description Representa o contrato serializado de documentação de um package UI.
 *
 * @property {'1.1'} schemaVersion - Versão do schema aceita pelo catálogo.
 * @property {string} packageName - Nome npm do package documentado.
 * @property {IManifestExport[]} exports - APIs públicas documentadas pelo package.
 */
export interface IManifest {
  schemaVersion: '1.1';
  packageName: string;
  exports: IManifestExport[];
}

/**
 * @description Representa uma API pública exposta por um package UI.
 *
 * @property {string} name - Nome público do export.
 * @property {TManifestExportKind} kind - Categoria da API exportada.
 * @property {string} source - Caminho fonte relativo ao package.
 * @property {IManifestProp[]} [props] - Props públicas do componente.
 * @property {IManifestEmit[]} [emits] - Eventos emitidos pelo componente.
 * @property {IManifestModel[]} [models] - Models declarados pelo componente.
 * @property {IManifestSlot[]} [slots] - Slots aceitos pelo componente.
 * @property {IManifestExpose[]} [exposes] - Membros expostos pelo componente.
 * @property {IManifestParameter[]} [parameters] - Parâmetros de funções e composables.
 * @property {string} [returnType] - Tipo de retorno de funções e composables.
 * @property {IManifestCssToken[]} [cssTokens] - Tokens CSS configuráveis.
 * @property {IManifestExample[]} [examples] - Exemplos de uso da API.
 * @property {IManifestSnippet[]} [snippets] - Snippets consumíveis pela IDE.
 */
export interface IManifestExport {
  name: string;
  kind: TManifestExportKind;
  source: string;
  props?: IManifestProp[];
  emits?: IManifestEmit[];
  models?: IManifestModel[];
  slots?: IManifestSlot[];
  exposes?: IManifestExpose[];
  parameters?: IManifestParameter[];
  returnType?: string;
  cssTokens?: IManifestCssToken[];
  examples?: IManifestExample[];
  snippets?: IManifestSnippet[];
}

/** @description Categorias de APIs exportadas pelo manifesto. */
export type TManifestExportKind =
  | 'class'
  | 'component'
  | 'composable'
  | 'function'
  | 'interface'
  | 'type';

/**
 * @description Representa uma prop pública de componente.
 * @property {string} name - Nome usado no template pelo consumidor.
 * @property {string} type - Representação textual do tipo TypeScript.
 * @property {boolean} required - Indica se a prop é obrigatória.
 * @property {string} [defaultValue] - Valor padrão declarado pelo componente.
 */
export interface IManifestProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * @description Representa um parâmetro de API pública.
 * @property {string} name - Nome do parâmetro.
 * @property {string} type - Representação textual do tipo TypeScript.
 * @property {boolean} optional - Indica se o parâmetro é opcional.
 */
export interface IManifestParameter {
  name: string;
  type: string;
  optional: boolean;
}

/**
 * @description Representa um evento emitido por um componente.
 * @property {string} name - Nome do evento.
 * @property {IManifestParameter[]} parameters - Payloads aceitos pelo evento.
 */
export interface IManifestEmit {
  name: string;
  parameters: IManifestParameter[];
}

/**
 * @description Representa um model declarado por componente.
 * @property {string} name - Nome da prop de model.
 * @property {string} type - Tipo TypeScript do model.
 * @property {boolean} required - Indica se o model é obrigatório.
 * @property {string} [defaultValue] - Valor padrão do model.
 * @property {string} updateEvent - Evento update associado ao model.
 */
export interface IManifestModel {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  updateEvent: string;
}

/**
 * @description Representa um slot aceito por componente.
 * @property {string} name - Nome do slot.
 * @property {IManifestParameter[]} parameters - Props fornecidas ao slot.
 */
export interface IManifestSlot {
  name: string;
  parameters: IManifestParameter[];
}

/**
 * @description Representa um membro exposto por componente.
 * @property {string} name - Nome disponível na template ref.
 * @property {'method' | 'property'} kind - Categoria do membro exposto.
 * @property {string} type - Tipo ou assinatura do membro.
 * @property {IManifestParameter[]} [parameters] - Parâmetros do método.
 * @property {string} [returnType] - Tipo de retorno do método.
 */
export interface IManifestExpose {
  name: string;
  kind: 'method' | 'property';
  type: string;
  parameters?: IManifestParameter[];
  returnType?: string;
}

/**
 * @description Representa uma Custom Property CSS configurável.
 * @property {`--${string}`} name - Nome da Custom Property CSS.
 * @property {string} [defaultValue] - Valor padrão aplicado pelo componente.
 * @property {string} [description] - Descrição do token CSS.
 */
export interface IManifestCssToken {
  name: `--${string}`;
  defaultValue?: string;
  description?: string;
}

/**
 * @description Representa um exemplo de uso da API.
 * @property {string} code - Código-fonte do exemplo.
 */
export interface IManifestExample {
  code: string;
}

/**
 * @description Representa um snippet consumível pela IDE.
 * @property {string} id - Identificador único do snippet.
 * @property {string[]} prefix - Prefixos de acionamento na IDE.
 * @property {string} description - Descrição do snippet.
 * @property {string} scope - Linguagem em que o snippet está disponível.
 * @property {string[]} body - Linhas que compõem o conteúdo do snippet.
 */
export interface IManifestSnippet {
  id: string;
  prefix: string[];
  description: string;
  scope: string;
  body: string[];
}
