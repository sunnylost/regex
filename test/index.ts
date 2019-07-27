import Re from '../src/'

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
