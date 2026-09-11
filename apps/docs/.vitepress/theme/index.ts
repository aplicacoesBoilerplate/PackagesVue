import DefaultTheme from 'vitepress/theme';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-core';

import type { Theme } from 'vitepress';

import BaseOverlayPreview from './components/BaseOverlayPreview.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app: pApp }) {
    pApp.component('BaseOverlay', BaseOverlay);
    pApp.component('BaseOverlayPreview', BaseOverlayPreview);
  },
} satisfies Theme;
