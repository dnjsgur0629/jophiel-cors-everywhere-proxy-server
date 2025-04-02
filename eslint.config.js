import globals from 'globals'
import mochaPlugin from 'eslint-plugin-mocha'

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    plugins: {
      mocha: mochaPlugin,
    },
    rules: {
      'array-bracket-spacing': ['error', 'never'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'computed-property-spacing': ['error', 'never'],
      curly: 'error',
      'eol-last': 'error',
      eqeqeq: ['error', 'smart'],
      'max-len': ['warn', 125],
      'new-cap': 'warn',
      'no-extend-native': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-trailing-spaces': 'error',
      'no-undef': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
      'keyword-spacing': 'error',
      'space-unary-ops': 'error',
    },
  },
]
