/**
 * @description Representa a documentação gerada de um package público.
 * @property schemaVersion - Versão do contrato do manifesto.
 * @property packageName - Nome npm do package documentado.
 * @property exports - APIs públicas encontradas no entry point.
 */
export interface IManifest {
  schemaVersion: '1.0';
  packageName: string;
  exports: IManifestExport[];
}

/**
 * @description Representa uma API pública de um package.
 * @property name - Nome público exportado.
 * @property kind - Categoria da API.
 * @property source - Caminho do arquivo-fonte relativo ao package.
 * @property props - Props de componentes Vue.
 * @property events - Eventos emitidos por componentes Vue.
 * @property slots - Slots públicos de componentes Vue.
 * @property cssTokens - Tokens CSS encontrados nos estilos do componente.
 */
export interface IManifestExport {
  name: string;
  kind: 'class' | 'component' | 'composable' | 'function' | 'interface' | 'type';
  source: string;
  props?: IManifestProp[];
  events?: IManifestEvent[];
  slots?: IManifestSlot[];
  cssTokens?: IManifestCssToken[];
}

/**
 * @description Representa uma prop pública de componente.
 * @property name - Nome da prop.
 * @property type - Tipo TypeScript declarado.
 * @property required - Indica se a prop é obrigatória.
 * @property defaultValue - Valor padrão, quando definido.
 */
export interface IManifestProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * @description Representa um evento público emitido por componente.
 * @property name - Nome do evento.
 * @property payloadType - Tipo do payload emitido.
 */
export interface IManifestEvent {
  name: string;
  payloadType?: string;
}

/**
 * @description Representa um slot público de componente.
 * @property name - Nome do slot.
 * @property description - Descrição declarada pelo mantenedor.
 */
export interface IManifestSlot {
  name: string;
  description?: string;
}

/**
 * @description Representa um token CSS configurável pelo consumidor.
 * @property name - Nome da Custom Property CSS.
 * @property defaultValue - Fallback aplicado pelo componente.
 * @property description - Descrição opcional do token.
 */
export interface IManifestCssToken {
  name: `--${string}`;
  defaultValue?: string;
  description?: string;
}
