import type { IRegisteredArtifact } from '@tools/docs/manifest/src/models/IRegistry.model';

import { CRegisterBaseOverlay } from '../components/bases/overlay/CRegisterBaseOverlay';
import { CRegisterBaseOverlayProps } from '../components/bases/overlay/CRegisterBaseOverlayProps';

/**
 * @description Agrega os registros públicos do package ui-core.
 */
export default class CPackageRegister {
  /**
   * @description Retorna as APIs que podem compor o entry point e o manifesto públicos.
   * @returns APIs declaradas para publicação pelo package.
   */
  public static getArtifacts(): IRegisteredArtifact[] {
    return [new CRegisterBaseOverlay().artifact, new CRegisterBaseOverlayProps().artifact];
  }
}
