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
O build estático é validado pela CI. A workflow **Build documentation** guarda o resultado como
artefato por 14 dias para inspeção e para um futuro deploy em infraestrutura interna.

Quando a hospedagem interna for definida, a mesma workflow poderá receber a etapa de deploy que usa
o diretório `apps/docs/.vitepress/dist`. Os desenvolvedores consumidores não precisam instalar
pacotes adicionais para consultar o catálogo publicado.

## Versionamento e publicação

O monorepo usa o Release Please centralizado, com versões independentes e um caller mantido nesta aplicação. [Configuração, versões iniciais e roteiro da etapa 1](docs/versioning.md).

O PR funcional para master precisa de milestone SemVer; cada pacote mantém seu cálculo nativo. Após o merge humano, a pipeline prepara o PR técnico. O merge desse segundo PR cria tags e GitHub Releases automaticamente. A etapa 1 não publica em registry; distribuição será tratada separadamente.

Conventional Commits continuam exigidos pelos hooks. Changesets deixou de ser um gate de PR e de controlar versões/publicação automaticamente. Não é necessário um RELEASE_TOKEN adicional para este fluxo: usa GITHUB_TOKEN, respeitando a política de criação de PRs do repositório.

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

O token nunca deve ser salvo no repositório. A publicação no registry pertence à etapa 2.
