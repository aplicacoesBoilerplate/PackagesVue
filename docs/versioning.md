# Versionamento do workspace: etapa 1

O caller pertence a esta aplicação: .github/workflows/release.yml. Ele aguarda a CI do commit integrado em master e chama o central/scripts na mesma revisão 4176883e69cf32fe36d1b893e246bbdc03885cf9. Apenas o job de release recebe escrita; sem secrets de registry herdados.

As cinco bibliotecas mantêm versões independentes. O Release Please calcula cada incremento pelos Conventional Commits e gera um PR técnico conjunto com versões, changelogs e lockfile. O contrato atual usa config-file/manifest-file/project-path e valida versões declaradas por milestone ou Release-As contra as tags do componente. Uma declaração global só pode identificar um componente; em entregas multipacote, preserve o cálculo nativo ou declare release-as por pacote no config. Depois da revisão, CI e merge do PR técnico, o motor publica tags/GitHub Releases dos componentes alterados, sem exigir outra milestone.

Os seeds refletem a branch real da migração: composables/utils/ui-core/ui-prime-vue 0.0.1 e ui-vuetify 1.1.1. Tags usam o nome completo, como @aplicacoesboilerplate/ui-vuetify@1.1.2. A tag antiga ui@1.1.1 continua intacta e não corresponde aos componentes novos. bootstrap-sha marca a base anterior à integração; o manifest evita downgrade ao migrar os nomes.

## Dependências e privados

node-workspace atualiza os ranges dos consumidores e package-lock.json. apps/docs é privado e participa como dependente das bibliotecas; skip-github-release/skip-changelog impedem uma tag/Release para esse auxiliar. exclude-paths evita que mudanças só no catálogo criem uma entrega própria; mudanças transitivas de dependência ainda atualizam seu package.json. A raiz privada e tools/docs/manifest/catalog ficam fora do manifest e não são versionados automaticamente nesta etapa.

publish-artifacts=false bloqueia npm publish. O antigo workflow Changesets foi substituído; o gate obrigatório de changeset e os comandos root de version/publish legados foram aposentados. Os arquivos/dependência Changesets permanecem como histórico, sem automação ativa. Os nomes, private, publishConfig e empacotamento dos pacotes foram preservados. Não reativar os dois escritores em paralelo.

## Verificação e progresso T5

Node22 e npm10.9.4 (devEngines) são usados na CI. npm é fixado antes da instalação, fora do diretório do projeto. Localmente, executar com npm10.9.4: npm ci, npm run verify -- --force e npm run pack:check. verify preserva lint/type-check/test/build; os workspaces atuais não declaram tarefa lint própria, portanto esse nome no Turbo não comprova lint adicional.

O cache automático npm do setup-node fica desabilitado: ele chama npm antes do passo que fixa a versão e o npm10.9.9 do runner viola devEngines. Essa falha foi reproduzida no primeiro CI remoto; a correção preserva a restrição npm10.9.4, sem relaxar o contrato. O cache Turbo permanece ativo.

O segundo CI limpo expôs uma corrida preexistente: exemplos importam o próprio pacote por sua API pública em dist/, mas type-check começava antes do build. O grafo Turbo agora exige o build do próprio workspace antes de type-check. Nenhum exemplo, teste ou verificação foi excluído; o diagnóstico TS2307 do runner é a evidência RED dessa correção.

A suíte central usa o motor/plugin reais para incremento independente, dependente privado, lockfile e exclusão da Release privada. T5: implementação e gate local aprovados, 17/17 tarefas verify executadas sem cache, pack:check das cinco bibliotecas e contrato YAML/seeds/privados/escritores antigos aprovado. Composables/utils usam passWithNoTests preexistente e não têm testes próprios; não se contabilizam como cobertura funcional. A instalação da baseline reportou 16 vulnerabilidades preexistentes (6 moderadas, 9 altas, 1 crítica); upgrades gerais ficam fora desta integração. O commit é publicado antes da tarefa seguinte.

Integração em codex/release-please-stage1 para release/v0.0.1; não promove features a master. O ciclo hospedado de PR/tag/Release segue pendente dos merges humanos pelo Git Flow da aplicação. Uma entrega fix:/feat: depois da base bootstrap deve exercitar esse ciclo; conferir os pacotes afetados e nenhuma distribuição antes de integrar o PR técnico.

[Contrato central](https://github.com/aplicacoesBoilerplate/.github/blob/4176883e69cf32fe36d1b893e246bbdc03885cf9/docs/pipelines/versionamento-release-please.md).

## Iteração documental T3

O site tem páginas dos cinco pacotes com versão/instalação do mesmo checkout e preserva o catálogo UI, seus previews e a API existente. Composables e utils indicam seus pontos de entrada ainda vazios; nenhuma feature pendente foi incorporada. A versão de apps/docs e schemaVersion não representam as bibliotecas.

Gate local aprovado: npm10.9.4 verify -- --force --concurrency=1, 17/17 tarefas sem cache, incluindo o VitePress real. O buildEnd exige versões e comandos de instalação nas cinco páginas e manifesta/export/API não vazia nas três bibliotecas UI. O caller documental usa o central fixado, install-dir raiz, build-script build e base /PackagesVue/. Pages foi habilitado pelo administrador; a publicação ainda aguarda promoção humana para master.

O primeiro gate não detectou que o Turbo em modo strict descartava DOCS_BASE e DOCS_SOURCE_SHA: a revisão independente encontrou assets em /assets/ no HTML recém-gerado. O build documental agora declara essas variáveis em env, incluindo seus valores no hash do cache. Os inputs também incluem release-please-config.json e os manifests dos cinco pacotes, inclusive composables/utils, que não são dependências diretas do app documental. Assim, mudar base, commit ou versão de pacote invalida a documentação sem propagar essas variáveis para os builds das bibliotecas. O buildEnd confere ainda os caminhos dos assets e o commit recebido.

## Homologação do consumidor

A CI acrescenta npm run test:consumer depois do verify. Um único fluxo TypeScript instala tarballs fora do monorepo, confere ESM/CJS/tipos e exercita os três overlays. A aplicação Vite gerada permite homologação no navegador; as páginas manuais também oferecem previews de cada biblioteca. [Reprodução](https://github.com/aplicacoesBoilerplate/PackagesVue/blob/master/tests/consumer/README.md).

Os callers usam o commit publicado da release central v0.1.0. O antigo SHA de desenvolvimento deixou de ser encontrado pelo Actions após a integração; os três workflows, guard/validator/manifest e lockfile do runtime foram comparados e permanecem idênticos.

Reparo verificado: 17/17 tarefas sem cache em 4m35s e nova execução em CI=true com 17/17, recompilando a documentação. Os cinco HTML finais têm /PackagesVue/assets/ e o SHA fornecido. VitePress rejeita em CI a ausência de base ou SHA, e o passo verify fornece ambos; desenvolvimento local preserva os defaults. ESLint e Prettier do config foram conferidos. A revalidação independente e os checks hospedados registram a entrega final no planejamento central.
