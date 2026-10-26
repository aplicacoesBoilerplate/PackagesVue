---
title: 'BaseOverlay'
---

# BaseOverlay

**Categoria:** `component`

**Fonte:** `src/components/bases/overlay/BaseOverlay.vue`

## Importação

```ts
import { BaseOverlay } from '@aplicacoesboilerplate/ui-prime-vue';
```

## Props

| Nome         | Tipo      | Obrigatória | Padrão            |
| ------------ | --------- | ----------- | ----------------- |
| `message`    | `string`  | Não         | `'Carregando...'` |
| `modelValue` | `boolean` | Sim         | -                 |

## Exemplos

### Exemplo 1

```vue
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
```

## Snippets

### `prime-vue-base-overlay`

Insere um BaseOverlay do PrimeVue controlado por estado reativo.

**Prefixos:** `prime-vue-base-overlay`

```vue
<BaseOverlay :modelValue="${1:lIsLoading}" message="${2:Carregando...}" />

<script setup lang="ts">
import { ref } from 'vue';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-prime-vue';

const lIsLoading = ref(false);
</script>
```
