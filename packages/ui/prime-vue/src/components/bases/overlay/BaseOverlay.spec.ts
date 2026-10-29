import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BaseOverlay from './BaseOverlay.vue';

describe('BaseOverlay', () => {
  it('exibe a mensagem quando está ativo', () => {
    const wrapper = mount(BaseOverlay, {
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

    expect(wrapper.get('[role="status"]').text()).toBe('Salvando dados');
  });

  it('não renderiza o conteúdo quando está inativo', () => {
    const wrapper = mount(BaseOverlay, {
      global: {
        stubs: {
          Teleport: true,
        },
      },
      props: {
        modelValue: false,
      },
    });

    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });
});
