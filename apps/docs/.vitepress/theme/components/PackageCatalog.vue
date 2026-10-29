<script setup lang="ts">
import { withBase } from 'vitepress';
import { data } from '../../../packages.data.ts';
</script>

<template>
  <table>
    <thead><tr><th>Pacote</th><th>Versão do código</th></tr></thead>
    <tbody><tr v-for="pkg in data.packages" :key="pkg.name">
      <td><a :href="withBase('/packages/' + pkg.slug)">{{ pkg.name }}</a></td>
      <td>{{ pkg.version }}</td>
    </tr></tbody>
  </table>
  <p>Commit documentado: <code>{{ data.sha.slice(0, 7) }}</code>. Versões independentes; publicação em registry é uma etapa separada.</p>
</template>
