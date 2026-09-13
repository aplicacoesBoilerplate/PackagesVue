/**
 * @description Representa a documentação estruturada de um package público.
 *
 * @property {'1.1'} schemaVersion - Versão do contrato serializado.
 * @property {string} packageName - Nome npm do package documentado.
 * @property {IManifestExport[]} exports - APIs reexportadas pelo entry point público.
 */
export interface IManifest {
  schemaVersion: '1.1';
  packageName: string;
  exports: IManifestExport[];
}

/**
 * @description Representa uma API pública reexportada por um package.
 *
 * Campos de componentes, como props, emits, models, slots e exposes, são
 * opcionais porque funções, classes, interfaces e types não possuem essa API.
 *
 * @property {string} name - Nome público do export.
 * @property {'class' | 'component' | 'composable' | 'function' | 'interface' | 'service' | 'type'} kind - Categoria da API.
 * @property {string} source - Caminho do fonte relativo ao package.
 * @property {IManifestProp[]} [props] - Props públicas do componente.
 * @property {IManifestEmit[]} [emits] - Eventos públicos emitidos pelo componente.
 * @property {IManifestModel[]} [models] - Models declarados com defineModel.
 * @property {IManifestSlot[]} [slots] - Slots públicos aceitos pelo componente.
 * @property {IManifestExpose[]} [exposes] - Membros expostos para template refs.
 * @property {IManifestParameter[]} [parameters] - Parâmetros de funções e composables.
 * @property {string} [returnType] - Tipo de retorno de funções e composables.
 * @property {boolean} [abstract] - Indica se uma classe é abstrata.
 * @property {IManifestTypeParameter[]} [typeParameters] - Parâmetros genéricos de classes.
 * @property {string} [extends] - Classe base declarada.
 * @property {string[]} [implements] - Contratos implementados pela classe.
 * @property {IManifestClassConstructor[]} [constructors] - Construtores públicos da classe.
 * @property {IManifestClassMember[]} [members] - Membros públicos da classe.
 * @property {IManifestCssToken[]} [cssTokens] - Tokens CSS configuráveis.
 * @property {IManifestExample[]} [examples] - Exemplos renderizados na documentação.
 * @property {IManifestSnippet[]} [snippets] - Snippets consumíveis pela CLI.
 */
export interface IManifestExport {
  id?: string;
  name: string;
  kind: 'class' | 'component' | 'composable' | 'function' | 'interface' | 'service' | 'type';
  source: string;
  props?: IManifestProp[];
  emits?: IManifestEmit[];
  models?: IManifestModel[];
  slots?: IManifestSlot[];
  exposes?: IManifestExpose[];
  parameters?: IManifestParameter[];
  returnType?: string;
  abstract?: boolean;
  typeParameters?: IManifestTypeParameter[];
  extends?: string;
  implements?: string[];
  constructors?: IManifestClassConstructor[];
  members?: IManifestClassMember[];
  cssTokens?: IManifestCssToken[];
  examples?: IManifestExample[];
  snippets?: IManifestSnippet[];
  navigation?: IManifestNavigation;
  description?: string;
  instructions?: string[];
  previews?: IManifestPreview[];
}

/**
 * @description Representa um parâmetro genérico declarado por uma classe.
 * @property {string} name - Nome do parâmetro genérico.
 * @property {string} [constraint] - Restrição declarada para o parâmetro.
 * @property {string} [default] - Valor padrão declarado para o parâmetro.
 */
export interface IManifestTypeParameter {
  name: string;
  constraint?: string;
  default?: string;
}

/**
 * @description Representa um construtor público de classe.
 * @property {IManifestParameter[]} parameters - Parâmetros aceitos pelo construtor.
 */
export interface IManifestClassConstructor {
  parameters: IManifestParameter[];
}

/**
 * @description Representa um membro público de classe.
 * @property {string} name - Nome do membro público.
 * @property {'method' | 'property'} kind - Categoria do membro.
 * @property {boolean} static - Indica se o membro é estático.
 * @property {string} type - Tipo da propriedade ou assinatura do método.
 * @property {IManifestParameter[]} [parameters] - Parâmetros do método.
 * @property {string} [returnType] - Retorno do método.
 * @property {boolean} [abstract] - Indica se o método é abstrato.
 */
export interface IManifestClassMember {
  name: string;
  kind: 'method' | 'property';
  static: boolean;
  type: string;
  parameters?: IManifestParameter[];
  returnType?: string;
  abstract?: boolean;
}

/**
 * @description Representa uma prop pública de componente.
 *
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
 * @description Representa um parâmetro de uma assinatura pública.
 *
 * É reutilizado por emits, slots, exposes, funções e composables.
 *
 * @property {string} name - Nome do parâmetro.
 * @property {string} type - Representação textual do tipo TypeScript.
 * @property {boolean} optional - Indica se o parâmetro possui questionToken.
 */
export interface IManifestParameter {
  name: string;
  type: string;
  optional: boolean;
}

/**
 * @description Representa um evento declarado com defineEmits.
 *
 * @property {string} name - Nome do evento emitido.
 * @property {IManifestParameter[]} parameters - Payloads aceitos pelo evento.
 */
export interface IManifestEmit {
  name: string;
  parameters: IManifestParameter[];
}

/**
 * @description Representa um model declarado com defineModel.
 *
 * @property {string} name - Nome da prop de model.
 * @property {string} type - Tipo TypeScript do model.
 * @property {boolean} required - Indica se o model é obrigatório.
 * @property {string} [defaultValue] - Valor padrão declarado pelo model.
 * @property {string} updateEvent - Evento update:* associado ao model.
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
 *
 * @property {string} name - Nome do slot, como default, header ou footer.
 * @property {IManifestParameter[]} parameters - Props fornecidas ao conteúdo do slot.
 */
export interface IManifestSlot {
  name: string;
  parameters: IManifestParameter[];
}

/**
 * @description Representa um membro tornado público com defineExpose.
 *
 * @property {string} name - Nome acessível pela template ref do componente.
 * @property {'method' | 'property'} kind - Categoria do membro exposto.
 * @property {string} type - Tipo da propriedade ou assinatura do método.
 * @property {IManifestParameter[]} [parameters] - Parâmetros quando o membro é método.
 * @property {string} [returnType] - Tipo de retorno quando o membro é método.
 */
export interface IManifestExpose {
  name: string;
  kind: 'method' | 'property';
  type: string;
  parameters?: IManifestParameter[];
  returnType?: string;
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
 * @description Representa um preview executável identificado fora do JSON.
 *
 * @property {string} id - Identificador usado pelo loader estático do preview.
 * @property {string} title - Título exibido para o cenário.
 * @property {string} code - Código-fonte do mesmo cenário carregável.
 */
export interface IManifestPreview {
  id: string;
  title: string;
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

/**
 * @description Metadados de navegação editoriais de uma API pública.
 *
 * @property {string} group - Grupo que receberá a API na documentação.
 * @property {number} order - Ordem da API dentro do grupo.
 */
export interface IManifestNavigation {
  group: string;
  order: number;
}
