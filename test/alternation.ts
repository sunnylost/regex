import Re from '../src'
import { MatchResult } from '../types'

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

    let expected: MatchResult = [
        'abc',
        'a',
        'a',
        undefined,
        'bc',
        undefined,
        'bc'
    ]
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

    let expected: MatchResult = ['234']
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

    let expected: MatchResult = ['CD']
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

    let expected: MatchResult = ['CD']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T9', () => {
    let re = new Re('(?:ab|cd)+|ef', 'i')
    let source = 'AEKFCDab'
    let result = re.match(source)

    let expected: MatchResult = ['CDab']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T10', () => {
    let re = new Re('(?:ab|cd)+|ef', 'i')
    let source = 'AEKeFCDab'
    let result = re.match(source)

    let expected: MatchResult = ['eF']
    expected.index = 3
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T11', () => {
    let re = new Re('11111|111')
    let source = '1111111111111111'
    let result = re.match(source)

    let expected: MatchResult = ['11111']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T12', () => {
    let re = new Re('xyz|...')
    let source = 'abc'
    let result = re.match(source)

    let expected: MatchResult = ['abc']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T13', () => {
    let re = new Re('(.)..|abc')
    let source = 'abc'
    let result = re.match(source)

    let expected: MatchResult = ['abc', 'a']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T14', () => {
    let re = new Re('.+: gr(a|e)y')
    let source = 'color: grey'
    let result = re.match(source)

    let expected: MatchResult = ['color: grey', 'e']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T15', () => {
    let re = new Re('(Rob)|(Bob)|(Robert)|(Bobby)')
    let source = 'Hi Bob'
    let result = re.match(source)

    let expected: MatchResult = ['Bob', undefined, 'Bob', undefined, undefined]
    expected.index = 3
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.3_A1_T16', () => {
    let re = new Re('()|')
    let source = ''
    let result = re.match(source)

    let expected: MatchResult = ['', '']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
