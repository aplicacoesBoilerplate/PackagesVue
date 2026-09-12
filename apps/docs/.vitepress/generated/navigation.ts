import type { DefaultTheme } from 'vitepress';

/** @description Navegação gerada automaticamente a partir dos manifests UI. */
export const NAVIGATION: DefaultTheme.NavItem[] = [
  { text: 'Catálogo', link: '/generated/' },
  { text: '@aplicacoesboilerplate/ui-core', link: '/generated/ui-core/' },
  { text: '@aplicacoesboilerplate/ui-prime-vue', link: '/generated/ui-prime-vue/' },
  { text: '@aplicacoesboilerplate/ui-vuetify', link: '/generated/ui-vuetify/' },
];

/** @description Barra lateral gerada automaticamente a partir dos manifests UI. */
export const SIDEBAR: DefaultTheme.Sidebar = {
  '/generated/ui-core/': [
    {
      text: '@aplicacoesboilerplate/ui-core',
      items: [
        { text: 'Visão geral', link: '/generated/ui-core/' },
        { text: 'BaseOverlay', link: '/generated/ui-core/base-overlay' },
        { text: 'IBaseOverlayProps', link: '/generated/ui-core/i-base-overlay-props' },
      ],
    },
  ],
  '/generated/ui-prime-vue/': [
    {
      text: '@aplicacoesboilerplate/ui-prime-vue',
      items: [
        { text: 'Visão geral', link: '/generated/ui-prime-vue/' },
        { text: 'BaseOverlay', link: '/generated/ui-prime-vue/base-overlay' },
      ],
    },
  ],
  '/generated/ui-vuetify/': [
    {
      text: '@aplicacoesboilerplate/ui-vuetify',
      items: [
        { text: 'Visão geral', link: '/generated/ui-vuetify/' },
        { text: 'BaseOverlay', link: '/generated/ui-vuetify/base-overlay' },
      ],
    },
  ],
};
