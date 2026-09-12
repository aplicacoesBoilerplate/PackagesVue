<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      :aria-label="message"
      class="base-overlay"
      role="status"
      aria-live="polite"
    >
      <div class="base-overlay__content">
        <span class="base-overlay__spinner" aria-hidden="true" />
        <span>{{ message }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { IBaseOverlayProps } from './types/BaseOverlay.types';

withDefaults(defineProps<IBaseOverlayProps>(), {
  message: 'Carregando...',
});
</script>

<style src="./BaseOverlay.scss" scoped lang="scss"></style>
