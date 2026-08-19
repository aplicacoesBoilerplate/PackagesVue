<template>
  <main class="playground">
    <section class="playground__card">
      <p class="playground__eyebrow">@aplicacoesboilerplate/ui</p>
      <h1>BaseOverlay</h1>
      <p>Exemplo mínimo de consumo local do primeiro componente publicável.</p>
      <button type="button" @click="handleShowOverlay">Exibir overlay</button>
    </section>
  </main>

  <BaseOverlay :model-value="showOverlay" message="Publicando componente..." />
</template>

<script setup lang="ts">
import { BaseOverlay } from '@aplicacoesboilerplate/ui';
import { ref } from 'vue';

const showOverlay = ref(false);

function handleShowOverlay(): void {
  showOverlay.value = true;
  window.setTimeout(() => {
    showOverlay.value = false;
  }, 1500);
}
</script>

<style src="App.scss" scoped lang="scss"></style>
