# Entrega

## 1. Realização Técnica

### Estabilização de Pipelines

- **Correção de Permissões:** Liberado o acesso do GitHub Actions para criação e aprovação de Pull Requests no nível da Organização, destravando o fluxo do Changesets.
- **Resolução de Binários Nativos:** Resolvido o erro de `MODULE_NOT_FOUND` do Rollup em ambiente Linux através da inclusão explícita de `@rollup/rollup-linux-x64-gnu` como `optionalDependency`, eliminando conflitos entre Windows e Linux.
- **Correção de Preprocessadores:** Instalado `sass-embedded` para garantir a compilação de arquivos `.scss` nos testes de componentes da biblioteca de UI.

### Otimização de Performance (Local e Remoto)

- **Implementação de Orquestração:** Introduzido o **Turborepo** para gerenciar a execução de tarefas no monorepo.
- **Cache Inteligente:** Configurado `turbo.json` com pipeline de dependências (`build` $\rightarrow$ `test`). Tarefas repetitivas agora são recuperadas do cache (`FULL TURBO`), reduzindo drasticamente o tempo de verificação local.
- **Aceleração de CI:** Implementado cache de artefatos `.turbo` no GitHub Actions, permitindo que as pipelines de validação ignorem pacotes não alterados.
- **Otimização de Hooks:** Substituído o `npm run verify` completo no `pre-push` por uma verificação focada em `type-check`, movendo a carga pesada de build e testes para a pipeline de CI, tornando o envio de código instantâneo.

## 2. Garantias de Funcionamento

- **Pipeline de CI:** O comando `npm run verify` agora utiliza o Turbo. Se um pacote não foi alterado, o resultado é instantâneo. Se foi alterado, apenas ele e seus dependentes são processados.
- **Envios Rápidos:** O fluxo de commit $\rightarrow$ push foi otimizado:
  - `pre-commit`: Apenas arquivos alterados (via `lint-staged`).
  - `pre-push`: Apenas verificação de tipos (essencial para evitar quebras óbvias).
  - `CI`: Validação completa e rigorosa em nuvem.

## 3. Fontes Modificados

- `.github/workflows/ci.yml`
- `package.json`
- `package-lock.json`
- `turbo.json`
- `.husky/pre-push`

## 4. Guia de Validação (p/ Teste)

1. **Teste de Performance Local:**


    - Execute `npm run verify` (Primeira vez: tempo normal).
    - Execute `npm run verify` novamente (Segunda vez: deve ser quase instantâneo com a mensagem `FULL TURBO`).

2. **Teste de Push:**


    - Realize uma alteração simples e execute `git push`. O processo deve ser significativamente mais rápido que a versão anterior.

3. **Validação de Pipeline:**


    - Verifique no GitHub Actions se o job `CI / validate` passa com sucesso e se o cache do Turbo está sendo restaurado/salvo.
