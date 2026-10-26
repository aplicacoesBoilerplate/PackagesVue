# Homologação do consumidor Vue e promoção para develop

**Status:** execução autorizada pelo usuário; implementação inline, recon/revisão independente por helpers.

## Problem Statement
A release candidata já contém a infraestrutura centralizada e documentação, mas a CI não demonstra todo o uso dos artefatos por aplicações externas. Homologar antes de promover para master.

## Goals
- [ ] Reconciliar develop com a release 9feefcf22e4217003d09c9782c2e4e61b43d103d sem alterar o produto ou reativar distribuição.
- [ ] Provar o uso de artefatos empacotados e registrar evidência reproduzível.
- [ ] Entregar candidato/PR para develop, com CI/revisão e pendências humanas explícitas.

## Out of Scope
| Feature | Reason |
| --- | --- |
| Central .github, Go e features pendentes | Usuário restringiu a iteração aos consumidores Java/Vue existentes. |
| Publicação npm/Maven e mudanças de produto não necessárias ao piloto | Distribuição permanece false; não coletar funcionalidades futuras. |
| Merge unilateral em develop/master | Preservar revisão/merges humanos combinados; entregar resultado concreto antes da integração. |

## Assumptions & Open Questions
| Decision | Default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Candidata | codex/consumer-homologation-v0.0.1 baseada na release e reconciliada com develop | Isola evidências/testes sem mexer em originais sujos ou features | Escolha de implementação |
| Homologação | Artefatos locais reais, sem registry/deploy | Verifica consumo sem publicar pacotes | Autorizado no fluxo aprovado |
| Corte | Baseline atual da release | PRs de features futuras ficam fora | Confirmado pelo usuário |

**Open questions:** none para executar os gates; aceite visual/produto e merges permanecem humanos.

## User Stories

### P1: Consumo real dos artefatos
**User Story:** Como mantenedor, quero verificar o pacote instalado em uma aplicação antes de promover a release.
**Acceptance Criteria:**
1. WHEN cinco tarballs candidatos forem instalados em consumidor isolado THEN imports ESM/CJS e tipos SHALL resolver os nomes públicos/versões/exports reais, sem aliases para os fontes do workspace.
2. WHEN o consumidor alternar modelValue de false para true e depois false THEN cada overlay UI SHALL exibir a mensagem própria, renderizar via Teleport no body com position fixed e voltar a ficar oculto. O fechamento é controlado pelo consumidor; não se presume evento close inexistente.
3. WHEN as páginas dos três pacotes UI forem homologadas THEN elas SHALL oferecer demonstração executável do respectivo pacote, sem importar o nome público antigo.
4. The ensaio SHALL preservar composables/utils com entradas ainda vazias e não afirmar integração específica com frameworks que o componente não implementa.
**Independent Test:** npm10.9.4 run verify; npm pack --ignore-scripts após build; consumidor real e browser; VitePress.

### P1: Promoção verificável
**User Story:** Como mantenedor, quero revisar uma candidata fiel à release e ao destino.
**Acceptance Criteria:**
1. WHEN a candidata for preparada THEN ela SHALL preservar as features da release e o contrato central fixado em080df5a, publish-artifacts=false e todos os testes existentes.
2. WHEN os gates terminarem THEN relatório e código SHALL ser commitados/publicados antes de abrir o PR para develop, identificando SHA, resultados e limitações.
3. WHEN a entrega for apresentada THEN ela SHALL conter revisão independente e CI da candidata; IF a integração depender de revisão humana THEN ela SHALL registrar esse estado sem declarar master ou Pages publicados.
**Independent Test:** Comparação Git, gate completo, sensor isolado e revisão independente.

## Edge Cases
- IF o ensaio usar fontes/aliases no lugar dos artefatos empacotados THEN ele SHALL falhar.
- IF qualquer gate falhar THEN a candidata SHALL permanecer sem promoção.
- IF surgirem defects fora do piloto THEN a entrega SHALL registrar o impedimento sem desenvolver features não aprovadas.

## Requirement Traceability
| Requirement ID | Story | Status |
| --- | --- | --- |
| CPRO-01 | Consumo real | Cinco tarballs/exports/tipos e três overlays aprovados; previews reais conferidos no navegador |
| CPRO-02 | Promoção verificável | Em preparação |

## Success Criteria
- [ ] Artefatos instalados e cenários funcionais aprovados.
- [ ] Gates preservados, evidências e sensor independentes aprovados.
- [ ] Candidata publicada e PR para develop entregue; master/deploy explicitamente pendentes da integração humana.

