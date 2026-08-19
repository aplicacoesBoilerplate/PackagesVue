# Packages Vue

Monorepo npm de bibliotecas reutilizáveis da organização Aplicacoes Boilerplate.

## Pacotes

| Pacote                               | Responsabilidade                             |
| ------------------------------------ | -------------------------------------------- |
| `@aplicacoesboilerplate/ui`          | Componentes Vue reutilizáveis.               |
| `@aplicacoesboilerplate/composables` | Composables Vue independentes de aplicações. |
| `@aplicacoesboilerplate/utils`       | Funções e classes puras compartilháveis.     |

O pacote `ui` disponibiliza o `BaseOverlay`, um overlay de tela inteira independente de Vuetify.
Cada pacote possui entrada pública, build ESM/CJS, declarações TypeScript e configuração de publicação.

## Desenvolvimento

```bash
npm install
npm run verify
```

Comandos principais:

```bash
npm run build
npm run lint
npm run type-check
npm run test
npm run pack:check
npm run changeset
npm run dev:docs
```

`vue` é uma `peerDependency` dos pacotes que o utilizam, portanto não é empacotado junto às
bibliotecas.

## Catálogo de componentes

`apps/docs` é o catálogo VitePress interno. Ele importa os componentes pelo nome público
`@aplicacoesboilerplate/ui`, portanto cada preview usa a mesma implementação distribuída aos
projetos consumidores.

```bash
npm run dev:docs
```

Abra a URL exibida pelo VitePress e navegue para **Componentes > BaseOverlay**. A página apresenta
preview interativo, contrato de props, acessibilidade e exemplos de importação e uso.

O catálogo é uma aplicação privada separada e não é incluído no bundle das aplicações consumidoras.
O build estático é validado pela CI e publicado no GitHub Pages a cada alteração em `main` que afete
o catálogo ou o pacote `ui`.

Para ativar a publicação, acesse **Settings > Pages** no repositório e configure a origem como
**GitHub Actions**. A URL do catálogo será exibida ao término da workflow **Deploy documentation**.
Os desenvolvedores consumidores devem usar essa URL como fonte de consulta, sem instalar pacotes
adicionais nas aplicações.

## Versionamento e publicação

O monorepo usa Changesets para versões independentes por pacote. Para toda alteração publicável:

```bash
npm run changeset
```

Selecione os pacotes afetados e o incremento semântico adequado. Inclua o arquivo criado em
`.changeset/` no commit. Pull requests que alteram `packages/*` sem changeset são recusadas pela CI.

O changeset incluído para `BaseOverlay` é `minor`: partindo de `@aplicacoesboilerplate/ui@1.0.0`, a
pull request de release preparará a versão `1.1.0` para publicação.

Após a mesclagem em `main`, a workflow `Release` cria ou atualiza uma pull request de versão. A
mesclagem dessa pull request atualiza versões e changelogs e publica os artefatos no GitHub Packages.

Os hooks do Husky executam Commitlint no commit, lint-staged antes do commit e `npm run verify`
antes do push. Eles não incrementam versões: a escolha explícita no Changeset evita versões erradas
quando uma mudança afeta mais de um pacote.

Para permitir a criação da pull request de versão, habilite **Allow GitHub Actions to create and
approve pull requests** nas configurações de Actions do repositório.

## Consumo privado

No projeto consumidor, configure o registro e um token com permissão `read:packages`:

```ini
@aplicacoesboilerplate:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Depois, instale normalmente:

```bash
npm install @aplicacoesboilerplate/ui
```

O token nunca deve ser salvo no repositório. A CI de publicação usa `GITHUB_TOKEN` com permissão
`packages: write`.
