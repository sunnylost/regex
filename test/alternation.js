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

test('15.10.2.3_A1_T4', () => {
    let re = new Re('\\d{3}|[a-z]{4}')
    let source = '2, 12 and 234 AND of course repeat 12'
    let result = re.match(source)

    let expected = ['234']
    expected.index = 10
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T5', () => {
    let re = new Re('\\d{3}|[a-z]{4}')
    let source = '2, 12 and 23 AND 0.00.1'
    expect(re.test(source)).toBe(false)
})

test('15.10.2.3_A1_T6', () => {
    let re = new Re('ab|cd|ef', 'i')
    let source = 'AEKFCD'
    let result = re.match(source)

    let expected = ['CD']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T7', () => {
    let re = new Re('ab|cd|ef')
    let source = 'AEKFCD'
    expect(re.test(source)).toBe(false)
})

test('15.10.2.3_A1_T8', () => {
    let re = new Re('(?:ab|cd)+|ef', 'i')
    let source = 'AEKFCD'
    let result = re.match(source)

    let expected = ['CD']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
