import Re from '../src'
import { IMatchResult } from '../types'

let source = `pairs\nmakes\tdouble`

test('15.10.2.6_A1_T1', () => {
    let re = new Re('s$')
    let result = re.match(source)

    let expected: IMatchResult = null

    expect(result).toEqual(expected)
})

test('15.10.2.6_A1_T2', () => {
    let re = new Re('e$')
    let result = re.match(source)

    let expected: IMatchResult = ['e']
    expected.index = 17
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A1_T3', () => {
    let re = new Re('s$', 'm')
    let result = re.match(source)

    let expected: IMatchResult = ['s']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A1_T4', () => {
    let re = new Re('[^e]$', 'mg')
    let result = re.match(source)

    let expected: IMatchResult = ['s']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A1_T5', () => {
    let re = new Re('es$', 'mg')
    let source = `pairs\nmakes\tdoubl\u0065s`
    let result = re.match(source)

    let expected: IMatchResult = ['es']
    expected.index = 17
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T1', () => {
    let re = new Re('^m')
    let result = re.match(source)

    let expected: IMatchResult = null

    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T2', () => {
    let re = new Re('^m', 'm')
    let result = re.match(source)

    let expected: IMatchResult = ['m']
    expected.index = 6
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T3', () => {
    let re = new Re('^p[a-z]')
    let source = 'pairs\nmakes\tdouble\npesos'
    let result = re.match(source)

    let expected: IMatchResult = ['pa']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T4', () => {
    let re = new Re('^p[b-z]', 'm')
    let source = 'pairs\nmakes\tdouble\npesos'
    let result = re.match(source)

    let expected: IMatchResult = ['pe']
    expected.index = 19
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T5', () => {
    let re = new Re('^[^p]', 'm')
    let source = 'pairs\nmakes\tdouble\npesos'
    let result = re.match(source)

    let expected: IMatchResult = ['m']
    expected.index = 6
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T6', () => {
    let re = new Re('^ab')
    let source = 'abcde'
    let result = re.match(source)

    let expected: IMatchResult = ['ab']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T7', () => {
    let re = new Re('^..^e')
    let source = 'ab\ncde'
    let result = re.match(source)

    let expected: IMatchResult = null

    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T8', () => {
    let re = new Re('^xxx')
    let source = 'yyyyy'
    let result = re.match(source)

    let expected: IMatchResult = null

    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T9', () => {
    let re = new Re('^\\^+')
    let source = '^^^x'
    let result = re.match(source)

    let expected: IMatchResult = ['^^^']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.6_A2_T10', () => {
    let re = new Re('^\\d+', 'm')
    let source = 'abc\n123xyz'
    let result = re.match(source)

    let expected: IMatchResult = ['123']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
