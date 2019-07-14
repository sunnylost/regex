module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    parser: 'babel-eslint',
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
        'prettier/prettier': 'error'
    },
    plugins: ['prettier']
}
