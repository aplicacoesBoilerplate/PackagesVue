<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { data } from '../../../packages.data.ts';

const { page, frontmatter } = useData();
const current = computed(() => data.packages.find(pkg =>
  pkg.name === frontmatter.value.package ||
  page.value.relativePath.startsWith('generated/' + pkg.slug + '/')));
</script>

<template>
  <div v-if="current" class="custom-block info">
    <p><strong>Versão do código documentado: {{ current.version }}</strong></p>
    <p>{{ current.name }} · commit <code>{{ data.sha.slice(0, 7) }}</code>.</p>
    <p>Dados deste checkout; não comprovam disponibilidade do pacote no registry.</p>
  </div>
</template>
