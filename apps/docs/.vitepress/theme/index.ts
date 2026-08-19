import { BaseOverlay } from '@aplicacoesboilerplate/ui';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import BaseOverlayPreview from './components/BaseOverlayPreview.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('BaseOverlay', BaseOverlay);
    app.component('BaseOverlayPreview', BaseOverlayPreview);
  },
} satisfies Theme;
