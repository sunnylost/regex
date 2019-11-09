import Re from '../../src'
import { IMatchResult } from '../../types'

test('15.10.2.6_A1_T1', () => {
    const re = new Re('s$')

    const source = 'pairs\nmakes\tdouble'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A1_T2', () => {
    const re = new Re('e$')

    const source = 'pairs\nmakes\tdouble'
    const result = re.match(source)

    const expected: IMatchResult = ['e']
    expected.index = 17
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A1_T3', () => {
    const re = new Re('s$', 'm')

    const source = 'pairs\nmakes\tdouble'
    const result = re.match(source)

    const expected: IMatchResult = ['s']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A1_T4', () => {
    const re = new Re('[^e]$', 'mg')

    const source = 'pairs\nmakes\tdouble'
    const result = re.match(source)

    const expected: IMatchResult = ['s']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A1_T5', () => {
    const re = new Re('es$', 'mg')

    const source = 'pairs\nmakes\tdoubl\u0065s'
    const result = re.match(source)

    const expected: IMatchResult = ['es']
    expected.index = 17
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A2_T1', () => {
    const re = new Re('^m')

    const source = 'pairs\nmakes\tdouble'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A2_T2', () => {
    const re = new Re('^m', 'm')

    const source = 'pairs\nmakes\tdouble'
    const result = re.match(source)

    const expected: IMatchResult = ['m']
    expected.index = 6
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A2_T3', () => {
    const re = new Re('^p[a-z]')

    const source = 'pairs\nmakes\tdouble\npesos'
    const result = re.match(source)

    const expected: IMatchResult = ['pa']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A2_T4', () => {
    const re = new Re('^p[b-z]', 'm')

    const source = 'pairs\nmakes\tdouble\npesos'
    const result = re.match(source)

    const expected: IMatchResult = ['pe']
    expected.index = 19
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A2_T5', () => {
    const re = new Re('^[^p]', 'm')

    const source = 'pairs\nmakes\tdouble\npesos'
    const result = re.match(source)

    const expected: IMatchResult = ['m']
    expected.index = 6
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A2_T6', () => {
    const re = new Re('^ab')

    const source = 'abcde'
    const result = re.match(source)

    const expected: IMatchResult = ['ab']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A2_T7', () => {
    const re = new Re('^..^e')

    const source = 'ab\ncde'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A2_T8', () => {
    const re = new Re('^xxx')

    const source = 'yyyyy'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A2_T9', () => {
    const re = new Re('^\\^+')

    const source = '^^^x'
    const result = re.match(source)

    const expected: IMatchResult = ['^^^']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A2_T10', () => {
    const re = new Re('^\\d+', 'm')

    const source = 'abc\n123xyz'
    const result = re.match(source)

    const expected: IMatchResult = ['123']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
