<template>
  <section class="base-overlay-preview">
    <div>
      <p class="base-overlay-preview__eyebrow">Preview interativo</p>
      <h2>Estado de carregamento</h2>
      <p>Altere a mensagem e acione o overlay usando o mesmo componente publicado no pacote.</p>
    </div>

    <label>
      Mensagem
      <input
        v-model="rMessage"
        type="text"
      />
    </label>

    <button
      type="button"
      @click="handleShowOverlay"
    >
      Exibir overlay
    </button>

    <component
      :is="rOverlay"
      :modelValue="rShowOverlay"
      :message="rMessage"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { BaseOverlay as CoreOverlay } from '@aplicacoesboilerplate/ui-core';
import { BaseOverlay as PrimeOverlay } from '@aplicacoesboilerplate/ui-prime-vue';
import { BaseOverlay as VuetifyOverlay } from '@aplicacoesboilerplate/ui-vuetify';

const lProps = withDefaults(
  defineProps<{
    package?: 'ui-core' | 'ui-prime-vue' | 'ui-vuetify';
  }>(),
  { package: 'ui-core' },
);
const lOverlays = {
  'ui-core': CoreOverlay,
  'ui-prime-vue': PrimeOverlay,
  'ui-vuetify': VuetifyOverlay,
};
const rOverlay = computed(() => lOverlays[lProps.package]);

const rMessage = ref('Carregando componente...');
const rShowOverlay = ref(false);

function handleShowOverlay(): void {
  rShowOverlay.value = true;
  window.setTimeout(() => {
    rShowOverlay.value = false;
  }, 1500);
}
</script>

<style scoped>
.base-overlay-preview {
  display: grid;
  gap: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
}

.base-overlay-preview h2,
.base-overlay-preview p {
  margin: 0;
}

.base-overlay-preview__eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
}

.base-overlay-preview label {
  display: grid;
  gap: 0.375rem;
  font-weight: 600;
}

.base-overlay-preview input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  padding: 0.625rem 0.75rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
}

.base-overlay-preview button {
  justify-self: start;
  cursor: pointer;
  border: 0;
  border-radius: 0.375rem;
  padding: 0.625rem 0.875rem;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  font: inherit;
  font-weight: 700;
}
</style>
