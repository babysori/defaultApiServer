module.exports = {
  extends: 'airbnb-base',
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './'],
          ['#', './subModule/'],
        ],
      },
    },
  },
  rules: {
    strict: 0,
    'linebreak-style': 0,
    'no-restricted-globals': 0,
    'no-param-reassign': 0,
    'max-len': ['error', {
      code: 160,
    }],
    'no-else-return': ['error', { allowElseIf: true }],
    'prefer-promise-reject-errors': 0,
    'consistent-return': 0,
    'no-unused-vars': 1,
    'no-restricted-syntax': 0,
    'no-continue': 0,
    'no-await-in-loop': 0,
    camelcase: 0,
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-dynamic-require': 0,
    'no-console': 0,
    'import/no-extraneous-dependencies': 0,
    'no-underscore-dangle': 0,
  },
};
