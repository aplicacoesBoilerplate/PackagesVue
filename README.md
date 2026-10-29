# Packages Vue

Monorepo npm de bibliotecas reutilizáveis da organização Aplicacoes Boilerplate.

## Pacotes

| Pacote                               | Responsabilidade                             |
| ------------------------------------ | -------------------------------------------- |
| `@aplicacoesboilerplate/ui-core`     | Componentes construídos com Vue nativo.       |
| `@aplicacoesboilerplate/ui-prime-vue` | Componentes para aplicações PrimeVue.         |
| `@aplicacoesboilerplate/ui-vuetify`   | Componentes para aplicações Vuetify.          |
| `@aplicacoesboilerplate/composables` | Composables Vue independentes de aplicações. |
| `@aplicacoesboilerplate/utils`       | Funções e classes puras compartilháveis.     |

As três bibliotecas UI disponibilizam suas próprias implementações de `BaseOverlay` e mantêm versões independentes.
Cada pacote possui entrada pública, build ESM/CJS, declarações TypeScript e configuração de publicação.

## Desenvolvimento

```bash
npm ci
npm run verify
```

Comandos principais:

```bash
npm run build
npm run lint
npm run type-check
npm run test
npm run pack:check
npm run dev:docs
```

`vue` é uma `peerDependency` dos pacotes que o utilizam, portanto não é empacotado junto às
bibliotecas.

## Catálogo de componentes

`apps/docs` contém páginas para os cinco pacotes e o catálogo de APIs das três bibliotecas UI.
As versões são lidas dos `package.json` do mesmo checkout. Os previews usam os fontes desse commit;
essa documentação não comprova que a distribuição no registry já foi executada.

```bash
npm run dev:docs
```

Antes do primeiro uso, execute `npm run build` na raiz para gerar os manifests das bibliotecas.
Abra a URL exibida pelo VitePress e navegue pelos pacotes ou pelo catálogo de APIs UI.

O catálogo é uma aplicação privada separada e não é incluído no bundle das aplicações consumidoras.
O caller `.github/workflows/docs-deploy.yml` usa a pipeline documental central: instala o workspace
com npm10.9.4, constrói os manifests e o site e publica GitHub Pages após promoção para master.
PRs executam somente o build. O destino configurado é [PackagesVue](https://aplicacoesboilerplate.github.io/PackagesVue/).

## Versionamento e publicação

O monorepo usa o Release Please centralizado, com versões independentes e um caller mantido nesta aplicação. [Configuração, versões iniciais e roteiro da etapa 1](docs/versioning.md).

O contrato atual calcula versões por componente e valida declarações milestone/Release-As contra suas tags. Para vários componentes alterados, mantenha o cálculo nativo ou declare versões por pacote; um override global ambíguo é bloqueado. Após o merge humano, a pipeline prepara o PR técnico. O merge desse segundo PR cria tags e GitHub Releases automaticamente. A etapa 1 não publica em registry; distribuição será tratada separadamente.

Conventional Commits continuam exigidos pelos hooks. Changesets deixou de ser um gate de PR e de controlar versões/publicação automaticamente. Não é necessário um RELEASE_TOKEN adicional para este fluxo: usa GITHUB_TOKEN, respeitando a política de criação de PRs do repositório.

## Consumo privado

No projeto consumidor, configure o registro e um token com permissão `read:packages`:

```ini
@aplicacoesboilerplate:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Depois, instale normalmente:

```bash
npm install @aplicacoesboilerplate/ui-core
```

O token nunca deve ser salvo no repositório. A publicação no registry pertence à etapa 2.
