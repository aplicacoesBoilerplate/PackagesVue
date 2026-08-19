# Relatório

## Tarefa Concluída

### Realização (Interno)

O boilerplate de aplicação foi convertido em um monorepo npm para bibliotecas Vue reutilizáveis.
Foram preparados os pacotes de componentes, composables e utilitários, todos prontos para gerar
artefatos de distribuição e tipagens TypeScript. Também foram configurados controles de qualidade,
versionamento individual dos pacotes e publicação privada automatizada no GitHub Packages. Nesta
evolução foi incluído o primeiro componente publicável, `BaseOverlay`, e um playground para uso local.

### Fontes Modificados

- `.changeset/config.json`
- `.changeset/silver-mirrors-move.md`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.gitignore`
- `.husky/commit-msg`
- `.husky/pre-commit`
- `.husky/pre-push`
- `.npmrc`
- `README.md`
- `apps/playground/index.html`
- `apps/playground/package.json`
- `apps/playground/public/favicon.svg`
- `apps/playground/src/App.vue`
- `apps/playground/src/main.ts`
- `apps/playground/tsconfig.json`
- `apps/playground/vite.config.ts`
- `config/commitlint.config.cjs`
- `config/eslint.config.js`
- `config/prettier.config.cjs`
- `package-lock.json`
- `package.json`
- `packages/composables/package.json`
- `packages/composables/src/index.ts`
- `packages/composables/tsconfig.json`
- `packages/composables/vite.config.ts`
- `packages/composables/vitest.config.ts`
- `packages/ui/package.json`
- `packages/ui/src/components/BaseOverlay.spec.ts`
- `packages/ui/src/components/BaseOverlay.vue`
- `packages/ui/src/index.ts`
- `packages/ui/tsconfig.json`
- `packages/ui/vite.config.ts`
- `packages/ui/vitest.config.ts`
- `packages/utils/package.json`
- `packages/utils/src/index.ts`
- `packages/utils/tsconfig.json`
- `packages/utils/vite.config.ts`
- `packages/utils/vitest.config.ts`
- `tsconfig.base.json`
- `vite.config.base.ts`

### p/ Teste

1. Abra o repositório e execute `npm install`.
2. Execute `npm run verify` e confirme que a validação termina sem erros.
3. Execute `npm run dev:playground` e abra o endereço exibido no navegador.
4. Selecione o botão **Exibir overlay**.
5. Confirme que a tela escurece, mostra a mensagem "Publicando componente..." e volta ao normal após cerca de dois segundos.
6. Execute `npm run changeset` e confirme que o pacote `ui` pode receber uma nova versão.
7. Confirme que o changeset já incluído prepara o pacote `ui` para a versão `1.1.0`.

### O que há de novo

O primeiro componente compartilhado já está pronto para publicação. Use o BaseOverlay nas aplicações e acompanhe sua entrega pela versão 1.1.0.
