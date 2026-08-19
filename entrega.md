# Relatório

## Tarefa Concluída

### Realização (Interno)

O boilerplate de aplicação foi convertido em um monorepo npm para bibliotecas Vue reutilizáveis.
Foram preparados os pacotes de componentes, composables e utilitários, todos prontos para gerar
artefatos de distribuição e tipagens TypeScript. Também foram configurados controles de qualidade,
versionamento individual dos pacotes e publicação privada automatizada no GitHub Packages. Nesta
evolução foi incluído o primeiro componente publicável, `BaseOverlay`, e um catálogo de documentação
interativo para uso interno.

### Fontes Modificados

- `.changeset/config.json`
- `.changeset/silver-mirrors-move.md`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/workflows/docs-deploy.yml`
- `.gitignore`
- `.husky/commit-msg`
- `.husky/pre-commit`
- `.husky/pre-push`
- `.npmrc`
- `README.md`
- `apps/docs/.vitepress/config.ts`
- `apps/docs/.vitepress/public/favicon.svg`
- `apps/docs/.vitepress/theme/components/BaseOverlayPreview.vue`
- `apps/docs/.vitepress/theme/index.ts`
- `apps/docs/componentes/base-overlay.md`
- `apps/docs/index.md`
- `apps/docs/package.json`
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
3. Execute `npm run dev:docs` e abra o endereço exibido no navegador.
4. Acesse o menu **Componentes** e selecione **BaseOverlay**.
5. Altere a mensagem no preview e selecione **Exibir overlay**.
6. Confirme que a tela escurece, apresenta a mensagem informada e volta ao normal após cerca de dois segundos.
7. Confira as seções de importação, uso, propriedades e acessibilidade na mesma página.
8. Execute `npm run changeset` e confirme que o pacote `ui` pode receber uma nova versão.
9. Confirme que o changeset já incluído prepara o pacote `ui` para a versão `1.1.0`.
10. No GitHub, habilite a origem **GitHub Actions** em **Settings > Pages** e confirme que a workflow
    **Deploy documentation** informa uma URL de acesso ao catálogo.

### O que há de novo

O primeiro componente compartilhado já está pronto para publicação e documentação. Use o catálogo para testar o BaseOverlay e acompanhar sua entrega pela versão 1.1.0.
