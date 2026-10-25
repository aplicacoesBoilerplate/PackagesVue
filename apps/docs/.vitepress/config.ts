import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitepress';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { readPackages, REPOSITORY_ROOT } from './package-metadata';

import { NAVIGATION, SIDEBAR } from './generated/navigation';

const lDocsBase = process.env.DOCS_BASE || '/';
const lNormalizedDocsBase = lDocsBase === '/' ? lDocsBase : `${lDocsBase.replace(/\/$/, '')}/`;

export default defineConfig({
  base: lNormalizedDocsBase,
  title: 'PackagesVue',
  description: 'Bibliotecas UI, composables e utilitários Vue com versões independentes.',
  buildEnd(site) {
    const packages = readPackages();
    assert.equal(packages.length, 5, 'O catálogo deve cobrir os cinco pacotes públicos');
    for (const pkg of packages) {
      const html = readFileSync(resolve(site.outDir, 'packages', pkg.slug + '.html'), 'utf8');
      assert.ok(html.replace(/<[^>]*>/g, '').includes('Versão do código documentado: ' + pkg.version), 'Versão ausente em ' + pkg.name);
      assert.ok(html.includes('npm install ' + pkg.name + '@' + pkg.version), 'Instalação divergente em ' + pkg.name);
      if (pkg.directory.startsWith('packages/ui/')) {
        const manifest = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, pkg.directory, 'dist/docs.manifest.json'), 'utf8'));
        assert.ok(manifest.exports.length > 0, 'Manifest UI vazio: ' + pkg.name);
        const api = readFileSync(resolve(site.outDir, 'generated', pkg.slug, 'index.html'), 'utf8');
        assert.ok(api.includes('BaseOverlay'), 'Catálogo UI vazio: ' + pkg.name);
        assert.ok(api.replace(/<[^>]*>/g, '').includes('Versão do código documentado: ' + pkg.version), 'Versão ausente na API de ' + pkg.name);
      }
    }
  },
  head: [
    ['link', { rel: 'icon', href: `${lNormalizedDocsBase}favicon.svg`, type: 'image/svg+xml' }],
  ],
  themeConfig: {
    nav: [{ text: 'Pacotes', link: '/packages/' }, { text: 'Instalação', link: '/instalacao' }, ...NAVIGATION],
    sidebar: {
      '/': [{ text: 'Packages', items: [
        { text: 'Visão geral', link: '/' },
        { text: 'Instalação', link: '/instalacao' },
        { text: 'Versão e publicação', link: '/versionamento' },
        ...readPackages().map(pkg => ({ text: pkg.slug, link: '/packages/' + pkg.slug })),
      ] }],
      ...SIDEBAR,
    },
  },
  vite: {
    resolve: {
      alias: {
        '@aplicacoesboilerplate/ui-core': fileURLToPath(
          new URL('../../../packages/ui/core/src/index.ts', import.meta.url),
        ),
        '@aplicacoesboilerplate/ui-prime-vue': fileURLToPath(
          new URL('../../../packages/ui/prime-vue/src/index.ts', import.meta.url),
        ),
        '@aplicacoesboilerplate/ui-vuetify': fileURLToPath(
          new URL('../../../packages/ui/vuetify/src/index.ts', import.meta.url),
        ),
      },
    },
    server: {
      allowedHosts: ['host.docker.internal'],
    },
  },
});
