module.exports = {
    verbose: true,
    testRegex: 'test/.*[ts]',
    testPathIgnorePatterns: ['/node_modules/'],
    transform: {
        '^.+\\.ts$': 'babel-jest'
    },
    transformIgnorePatterns: ['/node_modules/']
}
