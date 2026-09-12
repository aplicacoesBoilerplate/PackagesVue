import { CRegister } from './CRegister';

/**
 * @description Declara os metadados públicos do componente BaseOverlay.
 */
export class CRegisterBaseOverlay extends CRegister<'component'> {
  public readonly artifact = {
    id: 'base-overlay',
    name: 'BaseOverlay',
    sourceName: 'default',
    source: './components/bases/overlay/BaseOverlay.vue',
    kind: 'component' as const,
    navigation: {
      group: 'Componentes',
      order: 10,
    },
    description: 'Overlay de tela inteira para comunicar operações em andamento.',
    instructions: [
      'Controle a visibilidade com a prop modelValue.',
      'Forneça uma mensagem que descreva a operação em andamento.',
    ],
    previews: [
      {
        id: 'base-overlay-default',
        title: 'Uso básico',
        source: './components/bases/overlay/BaseOverlay.examples.vue',
      },
    ],
    snippets: [
      {
        id: 'ab-base-overlay',
        prefix: ['ab-base-overlay'],
        description: 'Insere um BaseOverlay controlado por estado reativo.',
        scope: 'vue',
        body: [
          '<BaseOverlay',
          '  :modelValue="${1:lIsLoading}"',
          '  message="${2:Carregando...}"',
          '/>',
          '',
          '<script setup lang="ts">',
          "import { ref } from 'vue';",
          '',
          "import { BaseOverlay } from '@aplicacoesboilerplate/ui-core';",
          '',
          'const lIsLoading = ref(false);',
          '</script>',
        ],
      },
    ],
  };
}
