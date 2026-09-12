import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

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
