import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

/**
 * @description Configuração do ESLint para o frontend (flat config).
 * Aplica regras de qualidade, padrões de código e consistência de estilo
 * seguindo as convenções definidas no guia do projeto.
 *
 * Regras aplicadas:
 * - Ordenação de imports por grupos (Ecossistema, Stores, Constantes, Types, Composables, Utils, Services, Componentes, Outros)
 * - Ordem de atributos em templates Vue (CONDITIONALS, LIST_RENDERING, TWO_WAY_BINDING, OTHER_DIRECTIVES, OTHER_ATTR, EVENTS)
 * - Ordem dos blocos .vue (template, script, style)
 * - Convenções de nomenclatura (prefixos T, I, C, p para parâmetros, camelCase, UPPER_CASE)
 * - Boas práticas Vue 3 e TypeScript
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'apps/docs/.vitepress/cache/**',
      'config/**/*.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      globals: {
        window: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    prettierConfig,
    plugins: {
      // Regras para JSDoc
      jsdoc,

      // Regras para sort import de componentes configurados (.vue)
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // #region Regras do JSDoc.
      'jsdoc/require-description': ['warn', { descriptionStyle: 'tag' }],
      'jsdoc/require-param': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/require-property': 'warn',
      'jsdoc/require-property-description': 'warn',
      'jsdoc/require-property-name': 'warn',
      'jsdoc/require-property-type': 'off',
      // #endregion

      // #region Regras de TS.
      // Impede o uso de 'any' como um tipo.
      '@typescript-eslint/no-explicit-any': 'error',

      // Reporta variáveis declaradas e não utilizadas, exceto parâmetros
      // intencionalmente ignorados quando iniciados por "_".
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      
      // Regras de convensão de nomes de seletores
      '@typescript-eslint/naming-convention': [
        'error',

        // Types iniciados com 'T' e em PascalCase tanto em type quanto como parâmetros.
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          prefix: ['T'],
        },
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          prefix: ['T'],
        },

        // Interfaces iniciadas com 'I' e em PascalCase.
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },

        // Classes iniciadas com 'C' e em PascalCase.
        {
          selector: 'class',
          format: ['PascalCase'],
          prefix: ['C'],
        },

        // Constantes reativas, locais ou globais: rIsLoading, lDefaultMessage, gApplicationName.
        {
          selector: 'variable',
          modifiers: ['const'],
          filter: {
            regex: '^[rlg][A-Z]',
            match: true,
          },
          format: ['PascalCase'],
          prefix: ['r', 'l', 'g'],
        },

        // Demais constantes: API_URL, DEFAULT_TIMEOUT.
        {
          selector: 'variable',
          modifiers: ['const'],
          filter: {
            regex: '^[rlg][A-Z]',
            match: false,
          },
          format: ['UPPER_CASE'],
        },

        // Variáveis não constantes: rIsLoading, lMessage, gState.
        {
          selector: 'variable',
          format: ['PascalCase'],
          prefix: ['r', 'l', 'g'],
        },

        // Funções e métodos precisam ser escritos em camelCase.
        {
          selector: ['function', 'method'],
          format: ['camelCase'],
        },

        // Parâmetros são iniciados com 'p' e escritos em PascalCase.
        {
          selector: 'parameter',
          format: ['PascalCase'],
          prefix: ['p'],
        },
      ],
      'no-console': 'warn',

      // #region Sort import.
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1° Imports de efeitos colaterais, como import './style.css' e afins.
            ['^\\u0000'],

            // 2° Módulos nativos do Node.js. 
            ['^node:'],

            // 3° vue e submódulos Vue.
            [
              '^vue$',
              '^vue/',
              '^vue3-',
              '^apexcharts',
              '^dayjs',
              '^html2canvas',
              '^jspdf',
              '^xlsx$'
            ],

            // 4° Dependências externas.
            ['^(?!@aplicacoesboilerplate/)(@?\\w|#)'],

            // 5° Packages próprios da organização.
            ['^@aplicacoesboilerplate/'],

            // 6° Imports de demais recursos que um componente pode utilizar.
            ['^@/constants'],
            ['^@/types', '^@/models', '^.+\\u0000$'],
            ['^@/composables'],
            ['^@/utils'],
            ['^@/services'],
            ['^@/components'],

            // 7° Imports absolutos e aliases não classificados acima.
            ['^'],

            // 8° Imports relativos: ./ e ../.
            ['^\\.'],
          ],
        },
      ],
      'no-undef': 'off',
      // #endregion
    
      // #region Regras vue
      // Apenas 1 atributo/prop por linha.
      'vue/max-attributes-per-line': [
        'warn',
        {
          singleline: { max: 1 },
          multiline: { max: 1 },
        },
      ],

      // Define a posição do primeiro atributo: ao lado da tag em elementos de
      // uma linha e abaixo da tag de abertura quando o elemento é multilinha.
      'vue/first-attribute-linebreak': [
        'warn',
        {
          singleline: 'beside',
          multiline: 'below',
        },
      ],

      // Fechar tag com '/>' em linha própria quando houver múltiplos atributos.
      'vue/html-closing-bracket-newline': [
        'warn',
        {
          singleline: 'never',
          multiline: 'always',
        },
      ],

      // Padroniza a indentação do template com dois espaços, incluindo atributos,
      // conteúdo interno e o fechamento de tags multilinha.
      'vue/html-indent': [
        'warn',
        2,
        {
          attribute: 1,
          baseIndent: 1,
          closeBracket: 0,
          alignAttributesVertically: false,
          ignores: [],
        },
      ],

      // Ordem em que os atributos são listados nos componentes.
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'SLOT',
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'ATTR_DYNAMIC',
            'ATTR_STATIC',
            'ATTR_SHORTHAND_BOOL',
            'EVENTS',
            'CONTENT',
          ],
          alphabetical: false,
        },
      ],
      // Silencia os erros de hyphenation que impedem o camelCase
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/v-on-event-hyphenation': ['error', 'never'],
      
      // Define a ordem das tags de um componente vue.
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],
      // #endregion
    }
  },
);
