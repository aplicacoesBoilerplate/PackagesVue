<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { data } from '../../../packages.data.ts';
const { frontmatter } = useData();
const current = computed(() => data.packages.find(pkg => pkg.name === frontmatter.value.package));
</script>

<template>
  <div v-if="current">
    <p>Para uma versão efetivamente disponibilizada no registry configurado:</p>
    <pre><code>npm install {{ current.name }}@{{ current.version }}</code></pre>
    <p v-for="(range, dependency) in current.peers" :key="dependency">Peer dependency: {{ dependency }} {{ range }}</p>
  </div>
</template>
