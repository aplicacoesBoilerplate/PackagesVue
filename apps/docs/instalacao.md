# Instalação e desenvolvimento

Cada biblioteca tem seu próprio nome e versão. [Consulte o catálogo](./packages/) para os comandos da versão documentada e as peer dependencies de cada package.

Para consumir versões efetivamente publicadas no GitHub Packages, configure o registry do escopo:

~~~ini
@aplicacoesboilerplate:registry=https://npm.pkg.github.com
~~~

Forneça autenticação com leitura de packages pela configuração do usuário ou CI. Nunca versione um token. O site identifica o código documentado e não garante que a distribuição npm dessa versão já foi executada.

## Desenvolver neste monorepo

Use Node22 e npm10.9.4, conforme devEngines.

~~~text
npm ci
npm run build
npm run verify
~~~

O build completo produz os manifests das bibliotecas antes do catálogo. Compilar apenas o app docs em um checkout limpo pode omitir o conteúdo das APIs. O build do site agora rejeita manifests UI ausentes/vazios.

[Versão e publicação](./versionamento)
