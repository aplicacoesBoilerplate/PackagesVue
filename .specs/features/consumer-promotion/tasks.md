# Homologação Vue: plano de execução

**Goal:** provar o consumo empacotado da release atual e preparar promoção para develop.
**Architecture:** consumidor isolado com artefatos reais; preservar fontes funcionais, contrato central e distribuição desligada.
**Spec:** spec.md. Execução inline já escolhida; helpers somente recon e revisão.

## Global Constraints
Sem writes no central .github ou Go; sem registry/deploy; sem coletar PRs futuros; sem merges remotos por conta própria.

## Test Coverage Matrix
| Layer | Required Test Type | Coverage | Location | Command |
| --- | --- | --- | --- | --- |
| Consumidor | Fluxo funcional real | CPRO-01 completo | um fluxo de consumidor empacotado; previews/guia documental; configuração mínima de gate; documentos de homologação | npm10.9.4 run verify; npm pack --ignore-scripts após build; consumidor real e browser; VitePress |
| Promoção | Gate/revisão | CPRO-02 | .specs/ e PR | Gate completo e APIs/Git |

## Gate Check Commands
| Gate | Command |
| --- | --- |
| Quick | Validadores TLC e git diff --check para documentação |
| Full | npm10.9.4 run verify; npm pack --ignore-scripts após build; consumidor real e browser; VitePress |
| Build | Full + revisão independente/CI |

## Execution Plan
```text
T1 -> T2 -> T3
```

## Task Breakdown
### T1: Preparar candidata e contrato
**Where**: .specs/ e histórico candidato.
**Depends on**: None
**Requirement**: CPRO-02
**Tests**: Comparar trees de merge e validar spec/tasks; nenhuma mudança de runtime.
**Gate**: Quick.
- [x] Branch isolada da release, develop reconciliada sem conflitos; contrato específico e plano registrados.
- [x] T1 publicada em7ed4ff0 antes de T2; merge tree idêntica à release e validadores sem erros.

### T2: Homologar consumidor empacotado
**Where**: um fluxo de consumidor empacotado; previews/guia documental; configuração mínima de gate; documentos de homologação.
**Depends on**: T1
**Requirement**: CPRO-01, CPRO-02
**Tests**: npm10.9.4 run verify; npm pack --ignore-scripts após build; consumidor real e browser; VitePress; todos os casos de spec.md.
**Gate**: Full.
- [x] Cinco pacotes instalados e três overlays aprovados por fluxo automático, tipos/build e navegador; previews documentais corrigidos sem modificar bibliotecas.
- [x] verify17/17 sem cache, fluxo consumidor e Cua aprovados; evidências/reprodução registradas para commit/push, revisão e CI em T3.

### T3: Revisar e entregar promoção
**Where**: validation.md, relatório e PR para develop.
**Depends on**: T2
**Requirement**: CPRO-02
**Tests**: Verifier distinto, sensor em scratch, CI e SHA remoto.
**Gate**: Build.
- [x] Revisão independente7/7ACs e CI/documentação aprovadas, preservando integrações humanas.
- [x] Checkpoint final reúne relatório/status para commit/push e PR40 para develop; conferir checks finais e tornar pronto para review.
