import Re from '../src'

test('syntax error', () => {
    expect(() => {
        new Re('a**')
    }).toThrow()

    expect(() => {
        new Re('a***')
    }).toThrow()

    expect(() => {
        new Re('a++')
    }).toThrow()

    expect(() => {
        new Re('a+++')
    }).toThrow()

    expect(() => {
        new Re('a???')
    }).toThrow()

    expect(() => {
        new Re('a????')
    }).toThrow()

    expect(() => {
        new Re('*a')
    }).toThrow()

    expect(() => {
        new Re('**a')
    }).toThrow()

    expect(() => {
        new Re('+a')
    }).toThrow()

    expect(() => {
        new Re('++a')
    }).toThrow()

    expect(() => {
        new Re('?a')
    }).toThrow()

    expect(() => {
        new Re('??a')
    }).toThrow()

    expect(() => {
        new Re('x{1}{1,}')
    }).toThrow()

    expect(() => {
        new Re('x{1,2}{1}')
    }).toThrow()

    expect(() => {
        new Re('x{1,}{1}')
    }).toThrow()

    expect(() => {
        new Re('x{0,1}{1,}')
    }).toThrow()
})
