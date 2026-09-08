import type { IManifestCssToken } from '../../models/IManifest.model';

/**
 * @description Extrai tokens CSS de expressões var(--token, fallback).
 */
export function parseCssTokens(pStyleContent: string): IManifestCssToken[] {
  const tokens = new Map<string, IManifestCssToken>();
  const tokenPattern = /var\(\s*(--[\w-]+)/g;

  for (const match of pStyleContent.matchAll(tokenPattern)) {
    const name = match[1] as `--${string}`;
    const startIndex = (match.index ?? 0) + match[0].length;
    const defaultValue = getCssVariableFallback(pStyleContent, startIndex);

    tokens.set(name, {
      name,
      defaultValue,
    });
  }

  return [...tokens.values()];
}

/**
 * @description Obtém o fallback de uma função var respeitando funções CSS aninhadas.
 */
function getCssVariableFallback(pContent: string, pStartIndex: number): string | undefined {
  let depth = 1;
  let hasFallback = false;
  let fallback = '';

  for (let index = pStartIndex; index < pContent.length; index += 1) {
    const character = pContent[index];

    if (character === '(') {
      depth += 1;
    }

    if (character === ')') {
      depth -= 1;

      if (depth === 0) {
        return hasFallback ? fallback.trim() : undefined;
      }
    }

    if (character === ',' && depth === 1 && !hasFallback) {
      hasFallback = true;
      continue;
    }

    if (hasFallback) {
      fallback += character;
    }
  }

  return undefined;
}
