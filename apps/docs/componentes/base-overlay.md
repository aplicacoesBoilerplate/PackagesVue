# BaseOverlay

Overlay de tela inteira para comunicar que uma operação está em andamento. Ele não depende de
Vuetify e utiliza `Teleport` para renderizar acima da aplicação consumidora.

<BaseOverlayPreview />

## Importação

```ts
import { BaseOverlay } from '@aplicacoesboilerplate/ui';
```

## Uso

```vue
<template>
  <BaseOverlay :model-value="isLoading" message="Salvando dados..." />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BaseOverlay } from '@aplicacoesboilerplate/ui';

const isLoading = ref(false);
</script>
```

## Props

| Nome         | Tipo      | Padrão          | Descrição                                |
| ------------ | --------- | --------------- | ---------------------------------------- |
| `modelValue` | `boolean` | -               | Controla a exibição do overlay.          |
| `message`    | `string`  | `Carregando...` | Mensagem anunciada e exibida ao usuário. |

## Acessibilidade

Quando visível, o componente fornece `role="status"`, `aria-live="polite"` e um rótulo com a
mensagem atual. A animação reduz a velocidade quando o sistema operacional indica preferência por
menos movimento.
