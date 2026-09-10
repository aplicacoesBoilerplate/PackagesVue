import type { IManifestSnippet } from "../../models/IManifest.model";

export async function validateSnippets(
  pSnippets: IManifestSnippet[],
  pEslintConfigPath: string,
): Promise<void> {
  const lEslint = new ESLint({
    overrideConfigFile: pEslintConfigPath,
  });

  for (const snippet of pSnippets) {
    const source = snippet.body.join('\n');
    const [result] = await lEslint.lintText(source, {
      filePath: `${snippet.id}.vue`,
    });

    if (result.errorCount > 0 || result.warningCount > 0) {
      throw new Error(`falhou ao validar a formatação do snippet: ${snippet.id} - ${snippet.prefix}`);
    }
  }
}
