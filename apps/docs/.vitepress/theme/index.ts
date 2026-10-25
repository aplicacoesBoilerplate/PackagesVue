import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-core';

import type { Theme } from 'vitepress';

import BaseOverlayPreview from './components/BaseOverlayPreview.vue';
import PackageVersion from './components/PackageVersion.vue';
import PackageCatalog from './components/PackageCatalog.vue';
import PackageInstall from './components/PackageInstall.vue';

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(PackageVersion) }),
  enhanceApp({ app: pApp }) {
    pApp.component('BaseOverlay', BaseOverlay);
    pApp.component('BaseOverlayPreview', BaseOverlayPreview);
    pApp.component('PackageCatalog', PackageCatalog);
    pApp.component('PackageInstall', PackageInstall);
  },
} satisfies Theme;
