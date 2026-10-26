<template>
  <BaseOverlay
    :modelValue="rIsLoading"
    message="Salvando dados..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-prime-vue';

const rIsLoading = ref(false);
</script>
