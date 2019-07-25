import Re from '../src'

test('15.10.2.3_A1_T1', () => {
    let re = new Re('a|ab')
    let result = re.match('abc')

    expect(result[0]).toBe('a')
    expect(result.index).toBe(0)
    expect(result.input).toBe('abc')
})

test('15.10.2.3_A1_T2', () => {
    let re = new Re('((a)|(ab))((c)|(bc))')
    let result = re.match('abc')

    let expected = ['abc', 'a', 'a', undefined, 'bc', undefined, 'bc']
    expected.input = 'abc'
    expected.index = 0

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T3', () => {
    let re = new Re('\\d{3}|[a-z]{4}')
    let source = '2, 12 and of course repeat 12'
    let result = re.match(source)

    let expected = ['cour']
    expected.index = 13
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
