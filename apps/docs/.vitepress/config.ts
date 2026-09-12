import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitepress';

import { NAVIGATION, SIDEBAR } from './generated/navigation';

const lDocsBase = process.env.DOCS_BASE || '/';
const lNormalizedDocsBase = lDocsBase === '/' ? lDocsBase : `${lDocsBase.replace(/\/$/, '')}/`;

export default defineConfig({
  base: lNormalizedDocsBase,
  title: 'Aplicacoes Boilerplate UI',
  description: 'Catálogo de componentes Vue reutilizáveis.',
  head: [
    ['link', { rel: 'icon', href: `${lNormalizedDocsBase}favicon.svg`, type: 'image/svg+xml' }],
  ],
  themeConfig: {
    nav: NAVIGATION,
    sidebar: SIDEBAR,
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
