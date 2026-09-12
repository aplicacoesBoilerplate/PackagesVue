export const PREVIEW_LOADERS: Record<string, () => Promise<unknown>> = {};

PREVIEW_LOADERS['base-overlay-default'] = () =>
  import('./components/bases/overlay/BaseOverlay.examples.vue');
