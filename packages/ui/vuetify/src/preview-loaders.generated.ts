export const PREVIEW_LOADERS: Record<string, () => Promise<unknown>> = {};

PREVIEW_LOADERS['vuetify-base-overlay-default'] = () =>
  import('./components/bases/overlay/BaseOverlay.examples.vue');
