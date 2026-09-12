<template>
  <BaseOverlay
    :modelValue="rIsLoading"
    message="Salvando dados..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-vuetify';

const rIsLoading = ref(false);
</script>
