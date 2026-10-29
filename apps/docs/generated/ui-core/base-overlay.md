---
title: 'BaseOverlay'
---

# BaseOverlay

**Categoria:** `component`

**Fonte:** `src/components/bases/overlay/BaseOverlay.vue`

## Importação

```ts
import { BaseOverlay } from '@aplicacoesboilerplate/ui-core';
```

## Props

| Nome         | Tipo      | Obrigatória | Padrão            |
| ------------ | --------- | ----------- | ----------------- |
| `message`    | `string`  | Não         | `'Carregando...'` |
| `modelValue` | `boolean` | Sim         | -                 |

## Tokens CSS

| Token                                     | Padrão                | Descrição |
| ----------------------------------------- | --------------------- | --------- |
| `--ab-ui-core-overlay-background`         | `rgb(15 17 23 / 68%)` | -         |
| `--ab-ui-core-overlay-color`              | `#fff`                | -         |
| `--ab-ui-core-overlay-content-background` | `rgb(26 29 39 / 96%)` | -         |
| `--ab-ui-core-overlay-content-gap`        | `0.75rem`             | -         |
| `--ab-ui-core-overlay-content-padding`    | `1rem 1.25rem`        | -         |
| `--ab-ui-core-overlay-content-radius`     | `0.75rem`             | -         |
| `--ab-ui-core-overlay-z-index`            | `1000`                | -         |

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

import { BaseOverlay } from '@aplicacoesboilerplate/ui-core';

const rIsLoading = ref(false);
</script>
```

## Snippets

### `ab-base-overlay`

Insere um BaseOverlay controlado por estado reativo.

**Prefixos:** `ab-base-overlay`

```vue
<BaseOverlay :modelValue="${1:lIsLoading}" message="${2:Carregando...}" />

<script setup lang="ts">
import { ref } from 'vue';

import { BaseOverlay } from '@aplicacoesboilerplate/ui-core';

const lIsLoading = ref(false);
</script>
```
