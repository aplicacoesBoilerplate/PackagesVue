import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitepress';

const docsBase = process.env.DOCS_BASE || '/';
const normalizedDocsBase = docsBase === '/' ? docsBase : `${docsBase.replace(/\/$/, '')}/`;

export default defineConfig({
  base: normalizedDocsBase,
  title: 'Aplicacoes Boilerplate UI',
  description: 'Catálogo de componentes Vue reutilizáveis.',
  head: [
    ['link', { rel: 'icon', href: `${normalizedDocsBase}favicon.svg`, type: 'image/svg+xml' }],
  ],
  themeConfig: {
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Componentes', link: '/componentes/base-overlay' },
    ],
    sidebar: {
      '/componentes/': [
        {
          text: 'Bases',
          items: [{ text: 'BaseOverlay', link: '/componentes/base-overlay' }],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/aplicacoesBoilerplate' }],
  },
  vite: {
    resolve: {
      alias: {
        '@aplicacoesboilerplate/ui': fileURLToPath(
          new URL('../../../packages/ui/src/index.ts', import.meta.url),
        ),
      },
    },
    server: {
      allowedHosts: ['host.docker.internal'],
    },
  },
});
