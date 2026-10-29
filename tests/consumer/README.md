# Consumidor empacotado do piloto

Com Node22.18+ e npm10.9.4, executar na raiz:

```text
npm ci
npm run verify -- --force --concurrency=1
npm run test:consumer
```

O fluxo TypeScript compila seus próprios tipos, empacota somente as cinco bibliotecas públicas com `--ignore-scripts` e instala os tarballs fora do monorepo. O build anterior é obrigatório: nenhum prepack oculto substitui o gate do workspace.

O ensaio usa os peers e ferramentas nas versões do lockfile. Exige instalação real sem links ao checkout, igualdade dos artefatos ESM/CJS/tipos com os candidatos, nomes/versões corretos, metadados/CSS e runtime vazio de composables/utils. Um teste com Vue real e DOM verifica os três overlays: oculto, mensagem/aria-label, Teleport no body, position fixed e retorno ao estado oculto quando o consumidor muda modelValue. Não existe evento close presumido.

Também gera e compila uma aplicação Vite consumidora, com três botões e fechamento controlado pela aplicação. O último JSON informa o diretório temporário. Para homologação no navegador, nesse diretório executar `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5179 --strictPort`. Abrir o endereço indicado e exercitar os três botões, conferindo a mensagem do pacote e o fechamento. Essa validação de navegador foi realizada pelo agente, além do teste automático com DOM; a CI executa o fluxo automático, tipos e build.

As implementações atuais são componentes Vue/DOM. O ensaio prova o consumo dos três pacotes; não afirma que eles utilizam componentes visuais nativos dos frameworks PrimeVue/Vuetify. Não publica npm, não instala pacotes privados auxiliares e não inclui as features futuras.
