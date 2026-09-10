<template>
  <BaseOverlay :model-value="isLoading" message="Salvando dados..." />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-core';

const isLoading = ref(false);
</script>
