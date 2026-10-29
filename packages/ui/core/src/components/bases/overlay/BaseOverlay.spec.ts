import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BaseOverlay from './BaseOverlay.vue';

describe('BaseOverlay', () => {
  it('exibe a mensagem quando está ativo', () => {
    const lWrapper = mount(BaseOverlay, {
      global: {
        stubs: {
          Teleport: true,
        },
      },
      props: {
        message: 'Salvando dados',
        modelValue: true,
      },
    });

    expect(lWrapper.get('[role="status"]').text()).toBe('Salvando dados');
  });

  it('não renderiza o conteúdo quando está inativo', () => {
    const lWrapper = mount(BaseOverlay, {
      global: {
        stubs: {
          Teleport: true,
        },
      },
      props: {
        modelValue: false,
      },
    });

    expect(lWrapper.find('[role="status"]').exists()).toBe(false);
  });
});
