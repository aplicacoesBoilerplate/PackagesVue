import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface IPackage {
  name: string;
  version: string;
  main: string;
  module: string;
  types: string;
  dir: string;
  private?: boolean;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCRATCH = mkdtempSync(join(tmpdir(), 'packages-vue-consumer-'));
const CONSUMER = join(SCRATCH, 'consumer');
const TARBALLS = join(SCRATCH, 'tarballs');
mkdirSync(CONSUMER);
mkdirSync(TARBALLS);
writeFileSync(join(SCRATCH, 'user.npmrc'), '');
writeFileSync(join(SCRATCH, 'global.npmrc'), '');
const ENV = {
  ...process.env,
  npm_config_userconfig: join(SCRATCH, 'user.npmrc'),
  npm_config_globalconfig: join(SCRATCH, 'global.npmrc'),
  npm_config_registry: 'https://registry.npmjs.org/',
};
const NPM_CLI = process.env.npm_execpath;
assert.ok(NPM_CLI, 'Execute por npm10.9.4 run test:consumer');

function execute(pArgs: string[], pCwd: string): string {
  const RESULT = spawnSync(process.execPath, pArgs, {
    cwd: pCwd,
    env: ENV,
    encoding: 'utf8',
    timeout: 300000,
  });
  assert.equal(
    RESULT.status,
    0,
    `${pArgs.join(' ')}\n${RESULT.error || ''}\n${RESULT.stdout}\n${RESULT.stderr}`,
  );
  return RESULT.stdout;
}
function npm(pArgs: string[], pCwd = ROOT): string {
  return execute([NPM_CLI!, ...pArgs], pCwd);
}
function write(pFile: string, pValue: string): void {
  writeFileSync(join(CONSUMER, pFile), pValue);
}
assert.equal(npm(['--version']).trim(), '10.9.4');
const CONFIG = JSON.parse(readFileSync(join(ROOT, 'release-please-config.json'), 'utf8'));
const LOCK = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));
const PUBLIC: IPackage[] = Object.keys(CONFIG.packages)
  .filter((pPath) => pPath.startsWith('packages/'))
  .map((pPath) => ({
    ...JSON.parse(readFileSync(join(ROOT, pPath, 'package.json'), 'utf8')),
    dir: join(ROOT, pPath),
  }))
  .filter((pPackage) => !pPackage.private);
assert.equal(PUBLIC.length, 5);
assert.equal(new Set(PUBLIC.map((pPackage) => pPackage.name)).size, 5);
const PACKED: { name: string; version: string; filename: string }[] = JSON.parse(
  npm([
    'pack',
    ...PUBLIC.flatMap((pPackage) => ['--workspace', pPackage.name]),
    '--ignore-scripts',
    '--json',
    '--pack-destination',
    TARBALLS,
  ]),
);
assert.equal(PACKED.length, 5);
const DEPENDENCIES: Record<string, string> = {};
for (const PACKAGE of PUBLIC) {
  const PACK = PACKED.find((pPack) => pPack.name === PACKAGE.name);
  assert.ok(PACK);
  assert.equal(PACK.version, PACKAGE.version);
  DEPENDENCIES[PACKAGE.name] = `file:${join(TARBALLS, PACK.filename).replaceAll('\\', '/')}`;
}
for (const NAME of ['vue', 'primevue', 'vuetify'])
  DEPENDENCIES[NAME] = LOCK.packages[`node_modules/${NAME}`].version;
const DEV: Record<string, string> = {};
for (const NAME of ['vite', 'typescript', 'happy-dom'])
  DEV[NAME] = LOCK.packages[`node_modules/${NAME}`].version;
write(
  'package.json',
  JSON.stringify(
    {
      name: 'packages-vue-pilot-consumer',
      version: '9.9.9',
      private: true,
      type: 'module',
      dependencies: DEPENDENCIES,
      devDependencies: DEV,
    },
    null,
    2,
  ),
);
write('expected.json', JSON.stringify(PUBLIC));
npm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], CONSUMER);

// Este módulo mora no consumidor: a resolução nunca parte dos node_modules do workspace.
write(
  'check.mjs',
  `
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';
const window = new Window();
for (const key of ['window','document','Element','HTMLElement','SVGElement','Node','Event','CustomEvent']) {
  Object.defineProperty(globalThis, key, { value: key === 'window' ? window : window[key], configurable: true });
}
const { h, render, nextTick } = await import('vue');
const require = createRequire(import.meta.url);
const expected = JSON.parse(readFileSync(new URL('./expected.json', import.meta.url), 'utf8'));
const installed = realpathSync(fileURLToPath(new URL('./node_modules', import.meta.url))) + sep;
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
for (const spec of expected) {
  const root = realpathSync(fileURLToPath(new URL('./node_modules/' + spec.name, import.meta.url)));
  assert.ok(root.startsWith(installed), 'Pacote deve estar instalado fora do monorepo');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, spec.name);
  assert.equal(pkg.version, spec.version);
  for (const field of ['module','main','types']) {
    assert.equal(pkg[field], spec[field]);
    assert.equal(hash(join(root, pkg[field])), hash(join(spec.dir, spec[field])), 'Artefato instalado diverge do candidato');
  }
  assert.ok(realpathSync(fileURLToPath(import.meta.resolve(spec.name))).startsWith(installed));
  assert.ok(realpathSync(require.resolve(spec.name)).startsWith(installed));
  const esm = await import(spec.name);
  const cjs = require(spec.name);
  if (!spec.name.includes('/ui-')) {
    assert.deepEqual(Object.keys(esm), []);
    assert.deepEqual(Object.keys(cjs), []);
    continue;
  }
  assert.ok(esm.BaseOverlay);
  assert.ok(cjs.BaseOverlay);
  const manifest = JSON.parse(readFileSync(require.resolve(spec.name + '/manifest'), 'utf8'));
  assert.equal(manifest.packageName, spec.name);
  assert.ok(manifest.exports.some(item => item.name === 'BaseOverlay'));
  JSON.parse(readFileSync(require.resolve(spec.name + '/snippets'), 'utf8'));
  const style = document.createElement('style');
  style.textContent = readFileSync(require.resolve(spec.name + '/style.css'), 'utf8');
  assert.ok(style.textContent.length > 0);
  document.head.appendChild(style);
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(h(esm.BaseOverlay, { modelValue: false, message: spec.name }), host);
  assert.equal(document.querySelector('[role="status"]'), null);
  render(h(esm.BaseOverlay, { modelValue: true, message: spec.name }), host);
  await nextTick();
  const overlay = document.querySelector('[role="status"]');
  assert.ok(overlay);
  assert.ok(overlay.textContent.includes(spec.name));
  assert.equal(overlay.getAttribute('aria-label'), spec.name);
  assert.equal(overlay.parentElement, document.body);
  assert.equal(window.getComputedStyle(overlay).position, 'fixed');
  render(h(esm.BaseOverlay, { modelValue: false, message: spec.name }), host);
  await nextTick();
  assert.equal(document.querySelector('[role="status"]'), null);
  render(null, host);
  host.remove();
  style.remove();
}
window.happyDOM.abort();
console.log('PASS: cinco pacotes instalados; ESM/CJS/tipos/metadados e três overlays controlados.');
`,
);
process.stdout.write(execute(['check.mjs'], CONSUMER));
write(
  'index.html',
  '<html lang="pt-BR"><meta charset="UTF-8"><title>Consumidor dos tarballs Vue</title><div id="app"></div><script type="module" src="/main.ts"></script></html>',
);
write(
  'main.ts',
  `
import { createApp, h, ref, type Component } from 'vue';
import { BaseOverlay as CoreOverlay } from '@aplicacoesboilerplate/ui-core';
import { BaseOverlay as PrimeOverlay } from '@aplicacoesboilerplate/ui-prime-vue';
import { BaseOverlay as VuetifyOverlay } from '@aplicacoesboilerplate/ui-vuetify';
import '@aplicacoesboilerplate/ui-core/style.css';
import '@aplicacoesboilerplate/ui-prime-vue/style.css';
import '@aplicacoesboilerplate/ui-vuetify/style.css';
const components: Record<string, Component> = { 'ui-core': CoreOverlay, 'ui-prime-vue': PrimeOverlay, 'ui-vuetify': VuetifyOverlay };
createApp({ setup() {
  const active = ref('');
  return () => h('main', { style: 'padding:32px;font-family:system-ui' }, [
    h('h1', 'Consumidor instalado por tarballs'),
    ...Object.keys(components).map(name => h('button', { onClick: () => active.value = name, style: 'margin:8px;padding:12px' }, 'Exibir ' + name)),
    active.value ? h(components[active.value], { modelValue: true, message: 'Artefato instalado: ' + active.value }) : null,
    active.value ? h('button', { onClick: () => active.value = '', style: 'position:fixed;top:16px;right:16px;z-index:999999;padding:12px' }, 'Fechar overlay') : null,
  ]);
} }).mount('#app');
`,
);
write(
  'tsconfig.json',
  JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      skipLibCheck: true,
      lib: ['ES2022', 'DOM'],
      noEmit: true,
      types: ['vite/client'],
    },
    include: ['main.ts'],
  }),
);
execute([join(CONSUMER, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], CONSUMER);
process.stdout.write(execute([join(CONSUMER, 'node_modules/vite/bin/vite.js'), 'build'], CONSUMER));
process.stdout.write(
  JSON.stringify({
    result: 'PASS',
    consumer: CONSUMER,
    packages: PUBLIC.map((pPackage) => ({ name: pPackage.name, version: pPackage.version })),
  }) + '\n',
);
