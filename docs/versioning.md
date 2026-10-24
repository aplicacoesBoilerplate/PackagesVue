# Versionamento do workspace: etapa 1

O caller pertence a esta aplicação: .github/workflows/release.yml. Ele aguarda a CI do commit integrado em master e chama o central/scripts na mesma revisão 1d874d946e5f5ad233a6b1f6bf278fef78f3b46d. Apenas o job de release recebe escrita; sem secrets de registry herdados.

As cinco bibliotecas mantêm versões independentes. O Release Please calcula cada incremento pelos Conventional Commits e gera um PR técnico conjunto com versões, changelogs e lockfile. A milestone SemVer continua obrigatória na entrega funcional, inclusive hotfix, mas nesta política native ela agrupa a entrega: não força uma versão escalar em todos os pacotes. Depois da revisão, CI e merge do PR técnico, o motor publica tags/GitHub Releases dos componentes alterados, sem exigir outra milestone.

Os seeds refletem a branch real da migração: composables/utils/ui-core/ui-prime-vue 0.0.1 e ui-vuetify 1.1.1. Tags usam o nome completo, como @aplicacoesboilerplate/ui-vuetify@1.1.2. A tag antiga ui@1.1.1 continua intacta e não corresponde aos componentes novos. bootstrap-sha marca a base anterior à integração; o manifest evita downgrade ao migrar os nomes.

## Dependências e privados

node-workspace atualiza os ranges dos consumidores e package-lock.json. apps/docs é privado e participa como dependente das bibliotecas; skip-github-release/skip-changelog impedem uma tag/Release para esse auxiliar. exclude-paths evita que mudanças só no catálogo criem uma entrega própria; mudanças transitivas de dependência ainda atualizam seu package.json. A raiz privada e tools/docs/manifest/catalog ficam fora do manifest e não são versionados automaticamente nesta etapa.

publish-artifacts=false bloqueia npm publish. O antigo workflow Changesets foi substituído; o gate obrigatório de changeset e os comandos root de version/publish legados foram aposentados. Os arquivos/dependência Changesets permanecem como histórico, sem automação ativa. Os nomes, private, publishConfig e empacotamento dos pacotes foram preservados. Não reativar os dois escritores em paralelo.

## Verificação e progresso T5

Node22 e npm10.9.4 (devEngines) são usados na CI. npm é fixado antes da instalação, fora do diretório do projeto. Localmente, executar com npm10.9.4: npm ci, npm run verify -- --force e npm run pack:check. verify preserva lint/type-check/test/build; os workspaces atuais não declaram tarefa lint própria, portanto esse nome no Turbo não comprova lint adicional.

A suíte central usa o motor/plugin reais para incremento independente, dependente privado, lockfile e exclusão da Release privada. T5: implementação e gate local aprovados, 17/17 tarefas verify executadas sem cache, pack:check das cinco bibliotecas e contrato YAML/seeds/privados/escritores antigos aprovado. Composables/utils usam passWithNoTests preexistente e não têm testes próprios; não se contabilizam como cobertura funcional. A instalação da baseline reportou 16 vulnerabilidades preexistentes (6 moderadas, 9 altas, 1 crítica); upgrades gerais ficam fora desta integração. O commit é publicado antes da tarefa seguinte.

Integração em codex/release-please-stage1 para release/v0.0.1; não promove features a master. O ciclo hospedado de PR/tag/Release segue pendente dos merges humanos pelo Git Flow da aplicação. Uma entrega fix:/feat: depois da base bootstrap deve exercitar esse ciclo; conferir os pacotes afetados e nenhuma distribuição antes de integrar o PR técnico.

[Contrato central](https://github.com/aplicacoesBoilerplate/.github/blob/1d874d946e5f5ad233a6b1f6bf278fef78f3b46d/docs/pipelines/versionamento-release-please.md).
