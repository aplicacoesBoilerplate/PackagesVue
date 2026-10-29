# Versões e publicação

<PackageCatalog />

O Release Please é o motor único. Cada pacote público possui versão independente, com tag no formato nome-completo-do-pacote@versão. Um PR técnico pode reunir atualizações de vários componentes; seu merge gera uma GitHub Release por componente liberado.

O caller consome config-file, manifest-file e project-path raiz do central, com o mesmo SHA nos scripts. A validação prévia segue o contrato atual: em entregas de vários componentes, prefira os incrementos nativos ou overrides por pacote. Uma milestone ou Release-As global não pode forçar versões ambíguas em vários pacotes alterados.

O número exibido nas páginas vem de cada package.json do mesmo checkout. schemaVersion do manifesto identifica o formato de documentação; a versão privada de apps/docs não representa as bibliotecas.

## Site e distribuição

publish-artifacts=false mantém npm publish desligado. O caller documental compila e publica Pages pelo workflow central. PRs compilam sem deploy; publicação ocorre na master após os merges e a configuração de Pages/environment.

Os previews usam os fontes do checkout, portanto documentação de uma branch release é uma prévia desse código, não prova de uma versão instalada do registry. A identidade do commit é mostrada no catálogo.

[Instalação](./instalacao)
