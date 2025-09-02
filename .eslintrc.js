// .eslintrc.js
module.exports = {
  extends: [
    '@antfu/eslint-config',
  ],
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    'jsx-quotes': ['error', 'prefer-double'],
    'react/react-in-jsx-scope': 'off',
    'no-debugger': 'off',
    'no-restricted-syntax': 'off',
    'no-console': 'off',
    'no-new': 'off',
    'node/prefer-global/process': 'off',
  },
  ignorePatterns: [
    'build/',
    'dist/',
    'node_modules/',
  ],
}
