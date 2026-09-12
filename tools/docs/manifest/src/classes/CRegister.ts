import type { IManifestExport } from '../models/IManifest.model';
import type { IRegisteredArtifact } from '../models/IRegistry.model';

/**
 * @description Base declarativa compartilhada para registrar uma API pública de package.
 *
 * A classe não importa nem executa o artefato registrado. Ela apenas fornece ao
 * gerador referências e metadados que serão validados contra a extração estática.
 */
export abstract class CRegister<TKind extends IManifestExport['kind']> {
  public abstract readonly artifact: IRegisteredArtifact<TKind>;
}
