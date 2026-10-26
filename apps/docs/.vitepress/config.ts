import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitepress';

import { NAVIGATION, SIDEBAR } from './generated/navigation';
import { readPackages, REPOSITORY_ROOT } from './package-metadata';

if (process.env.CI) {
  assert.ok(process.env.DOCS_BASE, 'Build documental em CI exige DOCS_BASE na tarefa Turbo');
  assert.ok(
    process.env.DOCS_SOURCE_SHA,
    'Build documental em CI exige DOCS_SOURCE_SHA na tarefa Turbo',
  );
}

const lDocsBase = process.env.DOCS_BASE || '/';
const lNormalizedDocsBase = lDocsBase === '/' ? lDocsBase : `${lDocsBase.replace(/\/$/, '')}/`;

export default defineConfig({
  base: lNormalizedDocsBase,
  title: 'PackagesVue',
  description: 'Bibliotecas UI, composables e utilitários Vue com versões independentes.',
  buildEnd(pSite) {
    const lPackages = readPackages();
    assert.equal(lPackages.length, 5, 'O catálogo deve cobrir os cinco pacotes públicos');
    for (const lPackage of lPackages) {
      const lHtml = readFileSync(
        resolve(pSite.outDir, 'packages', lPackage.slug + '.html'),
        'utf8',
      );
      assert.ok(
        lHtml.includes('href="' + lNormalizedDocsBase + 'assets/'),
        'Base dos assets divergente em ' + lPackage.name,
      );
      if (process.env.DOCS_SOURCE_SHA) {
        assert.ok(
          lHtml
            .replace(/<[^>]*>/g, '')
            .includes('commit ' + process.env.DOCS_SOURCE_SHA.slice(0, 7)),
          'Commit documentado divergente em ' + lPackage.name,
        );
      }
      assert.ok(
        lHtml.replace(/<[^>]*>/g, '').includes('Versão do código documentado: ' + lPackage.version),
        'Versão ausente em ' + lPackage.name,
      );
      assert.ok(
        lHtml.includes('npm install ' + lPackage.name + '@' + lPackage.version),
        'Instalação divergente em ' + lPackage.name,
      );
      if (lPackage.directory.startsWith('packages/ui/')) {
        const lManifest = JSON.parse(
          readFileSync(
            resolve(REPOSITORY_ROOT, lPackage.directory, 'dist/docs.manifest.json'),
            'utf8',
          ),
        );
        assert.ok(lManifest.exports.length > 0, 'Manifest UI vazio: ' + lPackage.name);
        const lApi = readFileSync(
          resolve(pSite.outDir, 'generated', lPackage.slug, 'index.html'),
          'utf8',
        );
        assert.ok(lApi.includes('BaseOverlay'), 'Catálogo UI vazio: ' + lPackage.name);
        assert.ok(
          lApi
            .replace(/<[^>]*>/g, '')
            .includes('Versão do código documentado: ' + lPackage.version),
          'Versão ausente na API de ' + lPackage.name,
        );
      }
    }
  },
  head: [
    ['link', { rel: 'icon', href: `${lNormalizedDocsBase}favicon.svg`, type: 'image/svg+xml' }],
  ],
  themeConfig: {
    nav: [
      { text: 'Pacotes', link: '/packages/' },
      { text: 'Instalação', link: '/instalacao' },
      ...NAVIGATION,
    ],
    sidebar: {
      '/': [
        {
          text: 'Packages',
          items: [
            { text: 'Visão geral', link: '/' },
            { text: 'Instalação', link: '/instalacao' },
            { text: 'Versão e publicação', link: '/versionamento' },
            ...readPackages().map((pPackage) => ({
              text: pPackage.slug,
              link: '/packages/' + pPackage.slug,
            })),
          ],
        },
      ],
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
