# Validation: consumer-promotion — PASS

As sete ACs, os gates de produto e os dois sensores passaram. O autor corrigiu o único achado, três linhas vazias no final dos documentos, no commit 279e850; o gate Quick completo foi repetido e aprovado. A candidata está apta à revisão técnica. O checkpoint final de evidências cabe ao autor; este relatório não autoriza merge nem publicação de artefatos.

- **Data:** 2026-10-26.
- **Spec:** `.specs/features/consumer-promotion/spec.md`.
- **Verifier:** subagente independente; autor e verifier distintos.
- **Candidata examinada:** `codex/consumer-homologation-v0.0.1`, produto testado em `8fa785411a86fc83fa95439e7c4661ee853ca255`; revisão final `279e85025e86cd883127bfb5a5dcb782f8945a8a` altera somente os três EOFs documentais, conforme diff independente.
- **Diff de homologação:** `9feefcf22e4217003d09c9782c2e4e61b43d103d..279e85025e86cd883127bfb5a5dcb782f8945a8a`. A release já contém develop `b4b80f0916d15a5c1941ad541b4b18ec17a3e819`; nenhuma feature futura foi coletada.
- **Isolamento:** `git archive HEAD` extraído em `C:/Users/gerso/AppData/Local/Temp/packages-vue-verifier-7efaf618780141fea023abb0e8372697/repo`; dependências instaladas do lockfile nessa cópia. Nenhum teste ou sensor alterou o checkout real.

## Task Completion

| Task | Estado verificado | Evidência |
| --- | --- | --- |
| T1 | Concluída | Release ancestral; develop ancestral; alteração das bibliotecas, ferramentas, lockfile, config e manifests de release igual a zero contra a release; validadores TLC sem erros/avisos. |
| T2 | Concluída | Gate completo, consumo baseline/restaurado, revisão dos previews e inspeção independente do HTML gerado aprovados. |
| T3 | Em fechamento | Revisão independente, correção EOF e CI de 279e850 aprovadas; checkpoint final de evidências/publicação ainda cabe ao autor. PR 40 já existe em draft para develop. |

Os marcadores pendentes de T3 em `tasks.md:53` e `tasks.md:54` refletem o fechamento/publicação; o verifier não marcou tarefa, spec ou STATE como concluídos.

## Spec-Anchored Acceptance Criteria

| Critério | Resultado esperado da spec | `file:line` e expressão/evidência | Resultado |
| --- | --- | --- | --- |
| CPRO-01.1, cinco tarballs e resolução pública | Cinco nomes/versões reais; imports ESM/CJS e tipos instalados fora do workspace | `tests/consumer/smoke.ts:65`, `assert.equal(PUBLIC.length, 5)`; `:77`, `assert.equal(PACKED.length, 5)`; `:82`, igualdade de versão; `:83`, dependências por tarball; `:130`, `root.startsWith(installed)`; `:132`, nome; `:133`, versão; `:135`, entradas module/main/types; `:136`, hashes iguais; `:138` e `:139`, realpaths de resolução ESM/CJS; `:147` e `:148`, `BaseOverlay` público; `:189` a `:191` e `:223`, imports tipados compilados no consumidor externo. Baseline e restaurado passaram. | PASS |
| CPRO-01.2, estados dos três overlays | false oculta; true mostra mensagem própria, aria-label, Teleport body e posição fixed; false oculta novamente | `tests/consumer/smoke.ts:159` a `:171`: `querySelector(...) === null`, `overlay.textContent.includes(spec.name)`, `getAttribute('aria-label') === spec.name`, `overlay.parentElement === document.body`, `getComputedStyle(overlay).position === 'fixed'`, retorno a null. Executado para cada pacote UI em Vue real com happy-dom. | PASS |
| CPRO-01.3, três demonstrações documentais | Cada página UI oferece preview do respectivo pacote; guia usa nome público atual | `apps/docs/packages/ui-core.md:15`, `apps/docs/packages/ui-prime-vue.md:15`, `apps/docs/packages/ui-vuetify.md:15`; `apps/docs/.vitepress/theme/components/BaseOverlayPreview.vue:35` a `:50`, imports e seleção por package; `:24` a `:27`, componente dinâmico com modelValue/mensagem; `:55` a `:59`, abertura/fechamento controlados; `apps/docs/componentes/base-overlay.md:6`, preview fora de fence; `:11` e `:26`, import ui-core. Inspeção independente dos três HTML recém-gerados aprovou preview, botão, versão exata, SHA e base de assets. | PASS |
| CPRO-01.4, limites honestos das APIs | Composables/utils continuam com runtime vazio; não alegar integração específica PrimeVue/Vuetify | `tests/consumer/smoke.ts:142` a `:145`, `Object.keys(esm/cjs)` igual a `[]`; `tests/consumer/README.md:17`, explicita Vue/DOM nativo. `git diff --exit-code` confirma nenhuma alteração em packages/ contra a release. | PASS |
| CPRO-02.1, fidelidade e contrato central | Preservar release, central 4176883, distribuição false e testes anteriores | `git merge-base --is-ancestor` aprovado para release e develop; diff zero em packages/, tools/, config/, lockfile, manifests e turbo.json. `.github/workflows/release.yml:17`, `:21`, `:34` e `:37` fixam 4176883; `:38`, `publish-artifacts: false`; `.github/workflows/docs-deploy.yml:15`, mesmo central. Quatro testes efetivos anteriores preservados sem enfraquecimento ou skips. | PASS |
| CPRO-02.2, checkpoint anterior ao PR | Código/relatório publicados com SHA, resultados e limitações identificados | `.specs/features/consumer-promotion/implementation-log.md:3` a `:10`, baseline, evidências e limites; commit `6718a91c78147c8e6aa4e32ac475008bafd11f52` publicado às 00:21:15-03:00 e `8fa7854` às 00:22:51-03:00, anteriores à abertura do PR 40 às 03:24:06Z. API do PR confirma head 8fa7854, base develop b4b80f0, open/draft e unmerged. Publicação deste relatório independente pertence ao checkpoint final de T3. | PASS para o checkpoint apresentado; fechamento T3 pendente |
| CPRO-02.3, revisão e CI sem alegar deploy | Revisão independente, CI da candidata e integração humana explícita | Este relatório e os sensores independentes; `.github/workflows/ci.yml:43` a `:49`, verify seguido de test:consumer. API/logs de CI confirmam ambos executados com sucesso. PR 40 permanece draft/open/unmerged; `.specs/features/consumer-promotion/spec.md:19`, merge unilateral fora do escopo. Master e Pages continuam pendentes da integração humana. | PASS |

As sete ACs têm evidência dos resultados definidos. Não foi encontrado gap de precisão da spec ou de comportamento. O único achado, whitespace documental, foi corrigido e revalidado sem alterar produto, teste ou critério.

## Gate Check

Ambiente independente: Windows host, Node `v24.19.0`, npm `10.9.4`. CLI fixada em `C:/Users/gerso/AppData/Local/npm-cache/_npx/4b0cc92362cfffad/node_modules/npm/bin/npm-cli.js`; o diretório `.bin` dessa instalação foi prefixado no PATH também para os subprocessos Turbo. `CI=true`, `DOCS_BASE=/PackagesVue/`, `DOCS_SOURCE_SHA=8fa785411a86fc83fa95439e7c4661ee853ca255`.

| Gate | Resultado observado |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` na cópia limpa | 605 dependências instaladas; exit 0. Nenhuma dependência adicionada à candidata. |
| `npm run verify -- --force --concurrency=1` | 17/17 tarefas, zero cache, 1m8.92s, exit 0. Inclui builds das bibliotecas/documentação, checagem de tipos e quatro testes efetivos. |
| Integridade dos testes | Antes: quatro efetivos, dois ui-core e dois parser. Depois: os mesmos quatro, zero falhas e zero skips novos. Composables/utils já executavam `--passWithNoTests` e continuam vazios; os arquivos de teste PrimeVue/Vuetify não têm runner configurado nesta baseline. 17 é número de tarefas, não de testes. |
| `npm run test:consumer`, baseline | Cinco tarballs instalados; ESM/CJS/tipos/metadata/hashes, três overlays e build Vite externo aprovados; exit 0. Consumidor `C:/Users/gerso/AppData/Local/Temp/packages-vue-consumer-m9xSYT/consumer`. |
| Inspeção independente dos HTML gerados | Três previews renderizados; versões core 0.0.1, PrimeVue 0.0.1 e Vuetify 1.1.1; instalação exata, commit 8fa7854 e `/PackagesVue/assets/` aprovados. Guia sem import do antigo pacote ui. |
| ESLint e Prettier dos TS/Vue e documentos funcionais alterados | Exit 0; nenhuma alteração para contornar regras. |
| Validadores `validate_spec.py` e `validate_tasks.py` | Ambos exit 0, zero erros e zero avisos. |
| `git diff --check origin/release/v0.0.1..HEAD` | Primeira revisão em 8fa7854: exit 2 por EOFs de `.specs/STATE.md:16`, `.specs/features/consumer-promotion/spec.md:63` e `.specs/features/consumer-promotion/tasks.md:55`. Autor corrigiu somente essas três linhas em 279e850; repetição independente contra a release: exit 0. `validate_spec.py` e `validate_tasks.py` repetidos: zero erros/avisos. |

A primeira tentativa do gate independente alcançou npm 11.17.0 pelos subprocessos Turbo e foi rejeitada por devEngines. A configuração de PATH foi corrigida antes do gate de 17/17; nenhum arquivo, requisito ou teste foi alterado para isso.

## Discrimination Sensor

Baseline passou antes das mutações. Duas falhas comportamentais foram aplicadas somente à cópia do arquivo/artefato, sem flags de texto no teste e sem `git stash`.

| Mutação | Local e falha injetada | Resultado observado |
| --- | --- | --- |
| M1, instalação por diretório | `tests/consumer/smoke.ts:83` no scratch: substituir o caminho do tarball por `PACKAGE.dir`, criando links npm para as pastas do checkout | Morta, exit 1 em `smoke.ts:130`: `Pacote deve estar instalado fora do monorepo`, actual false. O ensaio detecta o falso consumo por workspace. |
| M2, export público ESM quebrado | `packages/ui/core/dist/index.js:34` no scratch, após o build: `b as BaseOverlay` para `b as BrokenOverlay`; pack manteve `--ignore-scripts` | Morta, exit 1 em `smoke.ts:147`: `assert.ok(esm.BaseOverlay)`, actual undefined. Hash mutante antes/depois `efd2efefdc5d5b6d37a666b0d2f6b4062b677280bc58e7917a1c9762355482fc`, provando ausência de rebuild oculto. |

Profundidade leve, proporcional ao piloto: 2 injetadas, 2 mortas, 0 sobreviventes. Os arquivos foram restaurados byte a byte dos backups; `test:consumer` voltou a passar, incluindo tipos e build Vite externo, sem rebuild das bibliotecas. Consumidor restaurado: `C:/Users/gerso/AppData/Local/Temp/packages-vue-consumer-ibKu9G/consumer`.

- SHA-256 original/restaurado de `smoke.ts`: `ca4699a8ca3c893a669097eae2c5aebd2bf8673d0d8e6b8432faab937e74567f`.
- SHA-256 original/restaurado de `packages/ui/core/dist/index.js`: `d05f2d06ad0d08ae263666a54e1b54dbec1391318e8b069b4ee089f109189d4d`.
- Checkout real antes/depois dos sensores: porcelain vazio em ambos; HEAD 8fa7854 inalterado. Capturas em `real-before.txt`, `real-after.txt`, `head-before.txt` e `head-after.txt` na raiz do scratch. A escrita posterior deste relatório e as correções documentais autorizadas não fazem parte das mutações.
- As cópias temporárias não foram removidas fisicamente: a revisão automática rejeitou a tentativa de limpeza com `blocked by policy`, sem motivo detalhado. Não houve tentativa de contornar a rejeição. A fonte scratch foi restaurada e os consumidores mutantes continuam isolados no Temp; os logs/hashes foram retidos. Não houve remoção recursiva de junções.

## CI e revisão remota

Leitura independente via API e logs para PR [40](https://github.com/aplicacoesBoilerplate/PackagesVue/pull/40), base develop. A primeira execução de PR testou o merge sintético `b67151ec18e0d0aff51351c161e28968593e74f7`, que combina 8fa7854 com develop b4b80f0. A revisão final 279e850 também passou, no merge sintético `273a340c2611bb4d593d488580518127fc464d40`; API confirma head 279e850, open/draft/unmerged e base develop b4b80f0.

- [validate, job 121381942207](https://github.com/aplicacoesBoilerplate/PackagesVue/actions/runs/40263898800/job/121381942207): completed/success; Node 22.23.3; npm 10.9.4 fixado; verify 17/17, cache zero, 27.464s; test:consumer executou cinco pacotes, três overlays, tipos e Vite, PASS.
- [documentation / build, job 121381943751](https://github.com/aplicacoesBoilerplate/PackagesVue/actions/runs/40263899515/job/121381943751): completed/success.
- [documentation / deploy, job 121382140697](https://github.com/aplicacoesBoilerplate/PackagesVue/actions/runs/40263899515/job/121382140697): skipped, esperado no PR. Isso não é evidência de publicação Pages.
- Revisão final 279e850, [validate, job 121384639530](https://github.com/aplicacoesBoilerplate/PackagesVue/actions/runs/40264769278/job/121384639530): completed/success; verify 17/17, 16 em cache, documentação recompilada para o SHA atual; test:consumer executado novamente, PASS cinco pacotes, três overlays, tipos e Vite. [documentation / build, job 121384640865](https://github.com/aplicacoesBoilerplate/PackagesVue/actions/runs/40264769605/job/121384640865): success; deploy 121384834336: skipped esperado no PR.
- A revisão independente é este gate local. Nenhum review remoto, comentário, commit, push, merge ou alteração de PR foi feito pelo verifier.

## Evidência visual e limites

O autor, não este verifier, executou IAB/Cua no consumidor instalado por tarballs e nas três páginas documentais: abertura/fechamento, mensagens próprias, aria-label, position fixed, Teleport no body e ausência de erros de console. Capturas fornecidas: `C:/Users/gerso/.codex/visualizations/2026/09/29/01a0ef55-5c41-71c3-adea-da3a77ffb3da/consumer-homologation/vue-tarball-consumer.jpg` e `vue-documentation-preview.jpg` no mesmo diretório. O verifier executou Vue/happy-dom, tipos/build e inspeção de HTML independentemente; não repetiu Cua nem atribui as capturas a validação visual independente.

O ensaio prova consumo de componentes Vue/DOM dos três pacotes. Não prova uso de componentes nativos PrimeVue ou Vuetify. Não houve npm publish, implantação Pages, merge develop/master nem alteração no central .github ou Go.

## Code Quality e Edge Cases

- Alterações restritas ao ensaio, integração mínima na CI, previews/guia e documentos de homologação. Bibliotecas, versão, lockfile, manifest e config permanecem iguais à release.
- O ensaio usa ferramentas/peers do lockfile e não cria dependências no monorepo; pack/install com lifecycle desabilitado; build anterior obrigatório e empiricamente preservado no sensor M2.
- Cada verificação nova cobre consumo real, identidade pública, estado visual definido ou entrega verificável; os testes existentes não foram reduzidos, enfraquecidos ou ignorados.
- Fontes/aliases em vez de artefatos: M1 detectou; export ESM defeituoso: M2 detectou; gate com falha: achado EOF corrigido antes do PASS; features futuras: nenhuma incorporada.
- Diretrizes consideradas: spec/tasks locais, instruções AGENTS fornecidas, TLC validate/coding-principles e skill entregas. Não foi realizada auditoria de segurança ou integração específica de frameworks.

## Fix Plan e fechamento

1. **Menor, gate Quick, corrigido:** autor removeu somente as três linhas vazias no EOF em 279e850. Diff completo contra a release e validadores TLC foram repetidos pelo verifier e passaram. Nenhuma implementação foi alterada pelo verifier.
2. Publicar o checkpoint final de relatório/estado e conferir a CI da revisão publicada antes de apresentar a promoção como entregue. Marcar T3/traceabilidade é responsabilidade do autor. Não há fix técnico pendente. Master, Pages e merges permanecem dependentes da revisão/integração humana.

Não há fix de runtime ou sobrevivente de sensor. O sinal real de gate foi destilado como L-001 pelo script TLC, status candidate: conferir whitespace contra a baseline da release mesmo com checkout limpo. O fechamento documental teve uma rodada de correção; nenhum requisito ou teste foi enfraquecido. Logs e hashes ficam na raiz do scratch informado acima. Gate de fechamento `validate_state.py consumer-promotion`: exit 0, zero erros após salvar o veredito PASS.
