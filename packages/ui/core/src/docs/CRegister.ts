import type { IManifestExport } from '../../../../../tools/docs/manifest/src/models/IManifest.model';
import type { IRegisteredArtifact } from '../../../../../tools/docs/manifest/src/models/IRegistry.model';

/**
 * @description Base declarativa para registrar uma API pública do package.
 *
 * A classe não importa nem executa o artefato registrado. Ela apenas fornece ao
 * gerador referências e metadados que serão validados contra a extração estática.
 */
export abstract class CRegister<TKind extends IManifestExport['kind']> {
  public abstract readonly artifact: IRegisteredArtifact<TKind>;
}
