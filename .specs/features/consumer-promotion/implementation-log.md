# Homologação Vue

- T1 publicada em7ed4ff036b6d4f192b997a64a1dcf3d6db533118. Candidata da release9feefcf, develop já ancestral, originais sujos/features futuras preservados.
- O recon encontrou preview core dentro de fence e importação antiga no guia. As páginas manuais PrimeVue/Vuetify não tinham demonstração executável. Parametrizado o preview existente para três imports reais e incluído nas três páginas manuais, sem modificar os componentes das bibliotecas ou arquivos generated/.
- Um único fluxo TS em tests/consumer/smoke.ts empacota os cinco pacotes públicos e os instala em scratch externo, sem lifecycle de pack/install. Versões de peers/ferramentas vêm do lockfile; nenhuma dependência nova foi adicionada ao monorepo.
- Primeiro ensaio em Temp/packages-vue-consumer-ASMNy2/consumer: cinco pacotes, nomes/versões/realpaths e hash ESM/CJS/tipos conferidos; manifests/snippets/CSS corretos; composables/utils sem APIs de runtime. Os três overlays passaram os estados false/true/false com Vue real e happy-dom. Typecheck e build Vite externos aprovados.
- Gate completo npm10.9.4 verify -- --force --concurrency=1:17/17 tarefas, zero cache,1m41s, incluindo VitePress e os quatro testes existentes. Lint dos dois arquivos TS/Vue e formatação conferidos; sem adicionar tarefas de lint inexistentes aos pacotes.
- Navegador IAB/Cua: consumidor Vite127.0.0.1:5179 instalado por tarballs, três overlays abertos e fechados. Cada mensagem/aria-label corresponde ao pacote; position fixed e Teleportbody confirmados; zero erros de console. Evidência visual em Codex visualizations/consumer-homologation/vue-tarball-consumer.jpg.
- Site local compilado em127.0.0.1:5180/PackagesVue/: previews core/PrimeVue/Vuetify executados com mensagem própria, CSSfixed/Teleport e fechamento temporizado; zero erros de console. Versões0.0.1/0.0.1/1.1.1 exibidas por pacote; screenshot vue-documentation-preview.jpg no mesmo diretório de evidências.
- O fechamento é controle de modelValue pelo consumidor. Não foi inventado evento close nem alegada integração com componentes visuais específicos dos frameworks. APIs vazias dos dois packages permanecem honestas.
- T3 ainda exige repin dos callers para o central publicado, revisão independente/sensor e CI/PR para develop. Não houve merge remoto, npm publish ou implantação Pages.

## T3 em andamento

- Callers repinados para4176883e69cf32fe36d1b893e246bbdc03885cf9, release central publicada v0.1.0. A falha hospedada Java comprovou que Actions não encontrava080df5a, cuja branch antiga foi removida. Comparação dos três workflows, manifest/validator/guard e lockfile confirmou identidade dos arquivos de runtime, sem alterar o central.
- O consumidor Vue usa a mesma referência em uses/central-ref; documentação e distribuição false preservadas. Revisão independente e CI da candidata ainda pendentes.

## Checkpoint final

- Produto verificado em279e85025e86cd883127bfb5a5dcb782f8945a8a; PR40 para develop. verify17/17, cinco tarballs/ESM/CJS/tipos e três overlays/previews aprovados;2/2sensores detectados. Cua do autor separado dos gates independentes.
- CI40264769278 e documentação40264769605 aprovadas no mesmo SHA; deploy corretamente ignorado em PR. Relatório independente7/7ACs, validate_state e diff completo aprovados. Este checkpoint altera apenas metadados.
- Candidata inclui a baseline da release, sem coletar features futuras. Preferir merge commit na promoção para preservar a ancestralidade da release/bootstrap; depois revisar develop para master e comprovar Pages em execução real.
- Checkpoint publicado antes da revisão humana. Não houve merge remoto, publicação de pacotes ou alteração do central .github/Go.
