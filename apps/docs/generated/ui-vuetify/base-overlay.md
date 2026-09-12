---
title: 'BaseOverlay'
---

# BaseOverlay

**Categoria:** `component`

**Fonte:** `src/components/bases/overlay/BaseOverlay.vue`

## Importação

```ts
import { BaseOverlay } from '@aplicacoesboilerplate/ui-vuetify';
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

import { BaseOverlay } from '@aplicacoesboilerplate/ui-vuetify';

const rIsLoading = ref(false);
</script>
```

## Snippets

### `vuetify-base-overlay`

Insere um BaseOverlay do Vuetify controlado por estado reativo.

**Prefixos:** `vuetify-base-overlay`

```vue
<BaseOverlay :modelValue="${1:lIsLoading}" message="${2:Carregando...}" />

<script setup lang="ts">
import { ref } from 'vue';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-vuetify';

const lIsLoading = ref(false);
</script>
```
