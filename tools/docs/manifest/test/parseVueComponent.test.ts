import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { CManifest } from '../src/classes/CManifest';
import { parseEmits } from '../src/functions/parseVueComponent/parseEmits';
import { parseExposes } from '../src/functions/parseVueComponent/parseExposes';
import { parseModels } from '../src/functions/parseVueComponent/parseModels';
import { parseProps } from '../src/functions/parseVueComponent/parseProps';
import { parseSlots } from '../src/functions/parseVueComponent/parseSlots';
import { parseTypeScriptExport } from '../src/functions/parseVueComponent/parseTypeScriptExport';

const FIXTURE_FILE_PATH = resolve(
  import.meta.dirname,
  '../../../../packages/ui/core/src/components/bases/overlay/BaseOverlay.vue',
);
const FIXTURE_TYPE_FILE_PATH = resolve(
  import.meta.dirname,
  '../../../../packages/ui/core/src/components/bases/overlay/types/BaseOverlay.types.ts',
);
const REGISTERED_PACKAGE_CASES = [
  {
    artifactId: 'base-overlay',
    directory: resolve(import.meta.dirname, '../../../../packages/ui/core'),
    exportCount: 2,
    previewId: 'base-overlay-default',
    snippetId: 'core-base-overlay',
    temporaryDirectoryName: 'ui-core',
  },
  {
    artifactId: 'prime-vue-base-overlay',
    directory: resolve(import.meta.dirname, '../../../../packages/ui/prime-vue'),
    exportCount: 1,
    previewId: 'prime-vue-base-overlay-default',
    snippetId: 'prime-vue-base-overlay',
    temporaryDirectoryName: 'ui-prime-vue',
  },
  {
    artifactId: 'vuetify-base-overlay',
    directory: resolve(import.meta.dirname, '../../../../packages/ui/vuetify'),
    exportCount: 1,
    previewId: 'vuetify-base-overlay-default',
    snippetId: 'vuetify-base-overlay',
    temporaryDirectoryName: 'ui-vuetify',
  },
];
const MACROS_SOURCE = `
const lEmit = defineEmits<{
  saved: [pId: string];
  (pEvent: 'closed'): void;
}>();
const rModel = defineModel<string>('query', { required: true, default: 'all' });
const lSlots = defineSlots<{
  default(pItem: { id: string }): unknown;
  footer?: (pCount: number) => unknown;
}>();
function refresh(pForce?: boolean): void {}
const lState: string = 'ready';
defineExpose({ refresh, lState });
`;

test('extrai props importadas e exports TypeScript públicos', () => {
  assert.deepEqual(
    parseProps(
      FIXTURE_FILE_PATH,
      "import type { IBaseOverlayProps } from './types/BaseOverlay.types'; withDefaults(defineProps<IBaseOverlayProps>(), { message: 'Carregando...' });",
    ),
    [
      { name: 'modelValue', type: 'boolean', required: true },
      { name: 'message', type: 'string', required: false, defaultValue: "'Carregando...'" },
    ],
  );
  assert.deepEqual(
    parseTypeScriptExport(
      FIXTURE_TYPE_FILE_PATH,
      'IBaseOverlayProps',
      'IBaseOverlayProps',
      'src/components/bases/overlay/types/BaseOverlay.types.ts',
    ),
    [
      {
        name: 'IBaseOverlayProps',
        kind: 'interface',
        source: 'src/components/bases/overlay/types/BaseOverlay.types.ts',
      },
    ],
  );
});

test('extrai emits, models, slots e exposes tipados', () => {
  assert.deepEqual(parseEmits(FIXTURE_FILE_PATH, MACROS_SOURCE), [
    {
      name: 'saved',
      parameters: [{ name: 'pId', type: 'string', optional: false }],
    },
    { name: 'closed', parameters: [] },
  ]);
  assert.deepEqual(parseModels(FIXTURE_FILE_PATH, MACROS_SOURCE), [
    {
      name: 'query',
      type: 'string',
      required: true,
      defaultValue: "'all'",
      updateEvent: 'update:query',
    },
  ]);
  assert.deepEqual(parseSlots(FIXTURE_FILE_PATH, MACROS_SOURCE), [
    {
      name: 'default',
      parameters: [{ name: 'pItem', type: '{ id: string }', optional: false }],
    },
    {
      name: 'footer',
      parameters: [{ name: 'pCount', type: 'number', optional: false }],
    },
  ]);
  assert.deepEqual(parseExposes(FIXTURE_FILE_PATH, MACROS_SOURCE), [
    {
      name: 'refresh',
      kind: 'method',
      type: '(pForce: boolean) => void',
      parameters: [{ name: 'pForce', type: 'boolean', optional: true }],
      returnType: 'void',
    },
    { name: 'lState', kind: 'property', type: 'string' },
  ]);
});

test('extrai apenas o contrato público de classes abstratas e services', () => {
  const lTemporaryDirectory = mkdtempSync(resolve(import.meta.dirname, '.tmp-typescript-class-'));
  const lFilePath = resolve(lTemporaryDirectory, 'CUserService.ts');

  try {
    writeFileSync(
      lFilePath,
      `interface IEntity { id: string; }
interface IUser extends IEntity { name: string; }
interface IUserRepository { findById(pId: string): IUser | undefined; }

export abstract class CBaseRepository<TEntity extends IEntity = IEntity> {
  public readonly count = 0;
  protected readonly cache = new Map<string, TEntity>();
  private readonly token = 'private';

  public constructor(public readonly endpoint: string, pEnabled = true) {}

  public abstract save(pEntity: TEntity): Promise<TEntity>;

  public find<TFilter extends object>(pFilter: TFilter): TEntity[] {
    return [];
  }

  protected clear(): void {}
  private sign(): string { return this.token; }
}

export class CUserService extends CBaseRepository<IUser> implements IUserRepository {
  public static readonly scope = 'users';

  public findById(pId: string): IUser | undefined {
    return undefined;
  }
}
`,
      'utf8',
    );

    const [lBaseRepository] = parseTypeScriptExport(
      lFilePath,
      'CBaseRepository',
      'CBaseRepository',
      'src/classes/CBaseRepository.ts',
    );
    const [lUserService] = parseTypeScriptExport(
      lFilePath,
      'CUserService',
      'CUserService',
      'src/services/CUserService.ts',
      'service',
    );

    assert.equal(lBaseRepository?.kind, 'class');
    assert.equal(lBaseRepository?.abstract, true);
    assert.deepEqual(lBaseRepository?.typeParameters, [
      { name: 'TEntity', constraint: 'IEntity', default: 'IEntity' },
    ]);
    assert.deepEqual(lBaseRepository?.constructors, [
      {
        parameters: [
          { name: 'endpoint', type: 'string', optional: false },
          { name: 'pEnabled', type: 'boolean', optional: true },
        ],
      },
    ]);
    assert.deepEqual(lBaseRepository?.members?.map((pMember) => pMember.name).sort(), [
      'count',
      'find',
      'save',
    ]);
    assert.equal(
      lBaseRepository?.members?.find((pMember) => pMember.name === 'save')?.abstract,
      true,
    );
    assert.equal(lUserService?.kind, 'service');
    assert.equal(lUserService?.extends, 'CBaseRepository<IUser>');
    assert.deepEqual(lUserService?.implements, ['IUserRepository']);
  } finally {
    rmSync(lTemporaryDirectory, { force: true, recursive: true });
  }
});

test('gera APIs registradas, snippets e loaders de preview sem executar os exemplos', async () => {
  const lTemporaryDirectory = mkdtempSync(resolve(import.meta.dirname, '.tmp-docs-manifest-'));

  try {
    for (const lPackageCase of REGISTERED_PACKAGE_CASES) {
      const lTemporaryPackageDirectory = resolve(
        lTemporaryDirectory,
        lPackageCase.temporaryDirectoryName,
      );

      cpSync(lPackageCase.directory, lTemporaryPackageDirectory, { recursive: true });

      await CManifest.generateEntry(lTemporaryPackageDirectory);
      const lManifest = await CManifest.generate(lTemporaryPackageDirectory);
      const lBaseOverlay = lManifest.exports.find(
        (pExport) => pExport.id === lPackageCase.artifactId,
      );
      const lEntryPoint = readFileSync(resolve(lTemporaryPackageDirectory, 'src/index.ts'), 'utf8');
      const lPreviewLoaders = readFileSync(
        resolve(lTemporaryPackageDirectory, 'src/preview-loaders.generated.ts'),
        'utf8',
      );
      const lSnippets = JSON.parse(
        readFileSync(resolve(lTemporaryPackageDirectory, 'dist/snippets.json'), 'utf8'),
      ) as Record<string, unknown>;

      assert.equal(lManifest.exports.length, lPackageCase.exportCount);
      assert.deepEqual(lBaseOverlay?.navigation, { group: 'Componentes', order: 10 });
      assert.equal(lBaseOverlay?.previews?.[0]?.id, lPackageCase.previewId);
      assert.equal(lBaseOverlay?.snippets?.[0]?.id, lPackageCase.snippetId);
      assert.match(
        lBaseOverlay?.examples?.[0]?.code ?? '',
        new RegExp(`from '${lManifest.packageName}'`),
      );
      assert.match(lEntryPoint, /export \{ default as BaseOverlay \}/);
      assert.match(lPreviewLoaders, new RegExp(lPackageCase.previewId));
      assert.ok(lPackageCase.snippetId in lSnippets);
    }
  } finally {
    rmSync(lTemporaryDirectory, { force: true, recursive: true });
  }
});
