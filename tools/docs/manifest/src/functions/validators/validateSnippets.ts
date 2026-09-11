import { ESLint } from 'eslint';

import type { IManifestSnippet } from '../../models/IManifest.model';

/**
 * @description Valida snippets Vue com as mesmas regras de lint aplicadas aos fontes.
 *
 * Snippets de componentes podem conter um fragmento de template seguido de script
 * setup. O conteúdo é normalizado somente em memória para que o ESLint o analise
 * como um Single File Component válido, sem alterar o snippet que será exportado.
 *
 * @param pSnippets - Snippets extraídos do manifesto.
 * @param pEslintConfigPath - Caminho absoluto da configuração ESLint do repositório.
 * @throws Quando um snippet possui qualquer erro ou aviso de lint.
 */

export async function validateSnippets(
  pSnippets: IManifestSnippet[],
  pEslintConfigPath: string,
): Promise<void> {
  const lEslint = new ESLint({
    overrideConfigFile: pEslintConfigPath,
  });

  for (const lSnippet of pSnippets) {
    const lSource = normalizeVueSnippet(lSnippet.body.join('\n'));
    const [lResult] = await lEslint.lintText(lSource, {
      filePath: `${lSnippet.id}.vue`,
    });

    if (lResult.errorCount > 0 || lResult.warningCount > 0) {
      const lMessages = lResult.messages
        .map(
          (pMessage) =>
            `linha ${pMessage.line ?? 0}: ${pMessage.ruleId ?? 'eslint'} - ${pMessage.message}`,
        )
        .join('\n');

      throw new Error(`O snippet "${lSnippet.id}" não atende à convenção de lint:\n${lMessages}`);
    }
  }
}

/**
 * @description Normaliza um fragmento de snippet para um SFC Vue válido em memória.
 *
 * @param pSource - Conteúdo original do body do snippet.
 * @returns Fonte Vue pronta para análise do ESLint.
 */
function normalizeVueSnippet(pSource: string): string {
  const lSource = replaceSnippetPlaceholders(pSource).trim();

  if (lSource.startsWith('<template')) {
    return lSource;
  }

  const lScriptStartIndex = lSource.search(/<script(?:\s|>)/);
  if (lScriptStartIndex === -1) {
    return `<template>\n${lSource}\n</template>`;
  }

  const lTemplateContent = lSource.slice(0, lScriptStartIndex).trim();
  const lScriptContent = lSource.slice(lScriptStartIndex).trim();
  const lIndentedTemplateContent = indentTemplateContent(lTemplateContent);

  return `<template>\n${lIndentedTemplateContent}\n</template>\n\n${lScriptContent}`;
}

/**
 * @description Substitui tabstops do VS Code pelos valores padrão para análise estática.
 *
 * @param pSource - Fonte original do snippet.
 * @returns Fonte sem sintaxe exclusiva de snippets.
 */
function replaceSnippetPlaceholders(pSource: string): string {
  return pSource
    .replaceAll(/\$\{\d+:([^}]*)\}/g, '$1')
    .replaceAll(/\$\{\d+\}/g, '')
    .replaceAll(/\$\d+/g, '');
}

/**
 * @description Indenta um fragmento para que ele seja válido dentro de template.
 *
 * @param pTemplateContent - Conteúdo de template sem a tag template envolvente.
 * @returns Conteúdo indentado com dois espaços por linha.
 */
function indentTemplateContent(pTemplateContent: string): string {
  return pTemplateContent
    .split('\n')
    .map((pLine) => (pLine ? `  ${pLine}` : pLine))
    .join('\n');
}
