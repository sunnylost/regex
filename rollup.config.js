import typescript from 'rollup-plugin-typescript'

export default {
    input: 'src/index.ts',
    output: {
        file: 'dev/index.ts',
        format: 'cjs'
    },
    plugins: [typescript()]
}
