module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true
    },
    extends: ['plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        'no-constant-condition': ['error', { checkLoops: false }],
        'linebreak-style': ['error', 'unix'],
        quotes: [
            'error',
            'single',
            {
                allowTemplateLiterals: true
            }
        ],
        semi: ['error', 'never'],
        '@typescript-eslint/explicit-member-accessibility': 'off',
        'prettier/prettier': 'error'
    },
    plugins: ['@typescript-eslint', 'prettier']
}
