export const PREVIEW_LOADERS: Record<string, () => Promise<unknown>> = {};

PREVIEW_LOADERS['prime-vue-base-overlay-default'] = () =>
  import('./components/bases/overlay/BaseOverlay.examples.vue');
