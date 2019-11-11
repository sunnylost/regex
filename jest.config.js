module.exports = {
    verbose: true,
    testRegex: 'test/.*\\.ts',
    moduleFileExtensions: ['ts', 'js'],
    testPathIgnorePatterns: ['/node_modules/'],
    transform: {
        '\\.ts$': 'ts-jest'
    },
    transformIgnorePatterns: ['/node_modules/']
}
