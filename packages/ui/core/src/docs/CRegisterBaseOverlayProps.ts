import { CRegister } from './CRegister';

/**
 * @description Declara a interface pública associada ao BaseOverlay.
 */
export class CRegisterBaseOverlayProps extends CRegister<'interface'> {
  public readonly artifact = {
    id: 'base-overlay-props',
    name: 'IBaseOverlayProps',
    sourceName: 'IBaseOverlayProps',
    source: './components/bases/overlay/types/BaseOverlay.types.ts',
    kind: 'interface' as const,
    typeOnly: true,
    navigation: {
      group: 'Referência de API',
      order: 10,
    },
    description: 'Contrato das props aceitas pelo BaseOverlay.',
    instructions: [],
  };
}
