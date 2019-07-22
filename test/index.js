import Re from '../src'

/**
 * comes from https://github.com/tc39/test262/tree/master/test/built-ins/RegExp
 */

test('SyntaxError was thrown when max is finite and less than min', () => {
    expect(() => {
        new Re('0{2,1}')
    }).toThrow('numbers out of order in {} quantifier')
})

test(
    "SyntaxError was thrown when one character in CharSet 'A'\n" +
        "    greater than one character in CharSet 'B' ",
    () => {
        expect(() => {
            new Re('^[z-a]$')
        }).toThrow('Range out of order in character class')
    }
)

test('The | regular expression operator separates two alternatives', () => {
    let re = new Re('a|ab')
    let result = re.match('abc')

    expect(result[0]).toBe('a')
    expect(result.index).toBe(0)
    expect(result.input).toBe('abc')
})
