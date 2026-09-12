<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="base-overlay"
      role="status"
      aria-live="polite"
      :aria-label="message"
    >
      <div class="base-overlay__content">
        <span class="base-overlay__spinner" aria-hidden="true" />
        <span>{{ message }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * @property {boolean} modelValue - Controla a exibição do overlay.
 * @property {string} message - Mensagem opcional a ser renderizada no overlay.
 */
interface IBaseOverlayProps {
  modelValue: boolean;
  message?: string;
}

withDefaults(defineProps<IBaseOverlayProps>(), {
  message: 'Carregando...',
});
</script>

<style src="./BaseOverlay.scss" scoped lang="scss"></style>
