import type { IManifestCssToken } from '../../models/IManifest.model';

/**
 * @description Extrai tokens CSS de expressões var(--token, fallback).
 * @param {string} pStyleContent - Conteúdo CSS no qual os tokens serão localizados.
 * @returns {IManifestCssToken[]} Tokens CSS configuráveis encontrados.
 */
export function parseCssTokens(pStyleContent: string): IManifestCssToken[] {
  const lTokens = new Map<string, IManifestCssToken>();
  const lTokenPattern = /var\(\s*(--[\w-]+)/g;

  for (const lMatch of pStyleContent.matchAll(lTokenPattern)) {
    const lName = lMatch[1] as `--${string}`;
    const lStartIndex = (lMatch.index ?? 0) + lMatch[0].length;
    const lDefaultValue = getCssVariableFallback(pStyleContent, lStartIndex);

    lTokens.set(lName, {
      name: lName,
      defaultValue: lDefaultValue,
    });
  }

  return [...lTokens.values()];
}

/**
 * @description Obtém o fallback de uma função var respeitando funções CSS aninhadas.
 * @param {string} pContent - Conteúdo CSS que contém a expressão var.
 * @param {number} pStartIndex - Índice imediatamente após o nome do token.
 * @returns {string | undefined} Fallback declarado ou undefined quando não existir.
 */
function getCssVariableFallback(pContent: string, pStartIndex: number): string | undefined {
  let lDepth = 1;
  let lHasFallback = false;
  let lFallback = '';

  for (let lIndex = pStartIndex; lIndex < pContent.length; lIndex += 1) {
    const lCharacter = pContent[lIndex];

    if (lCharacter === '(') {
      lDepth += 1;
    }

    if (lCharacter === ')') {
      lDepth -= 1;

      if (lDepth === 0) {
        return lHasFallback ? lFallback.trim() : undefined;
      }
    }

    if (lCharacter === ',' && lDepth === 1 && !lHasFallback) {
      lHasFallback = true;
      continue;
    }

    if (lHasFallback) {
      lFallback += lCharacter;
    }
  }

  return undefined;
}
