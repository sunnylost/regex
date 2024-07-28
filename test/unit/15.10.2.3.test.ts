import { test, expect } from 'bun:test'
import Re from '../../src'
import { IMatchResult } from '../../types'

test('15.10.2.3_A1_T1', () => {
    const re = new Re('a|ab')

    const source = 'abc'
    const result = re.match(source)

    const expected: IMatchResult = ['a']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T2', () => {
    const re = new Re('((a)|(ab))((c)|(bc))')

    const source = 'abc'
    const result = re.match(source)

    const expected: IMatchResult = [
        'abc',
        'a',
        'a',
        undefined,
        'bc',
        undefined,
        'bc'
    ]
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T4', () => {
    const re = new Re('\\d{3}|[a-z]{4}')

    const source = '2, 12 and 234 AND of course repeat 12'
    const result = re.match(source)

    const expected: IMatchResult = ['234']
    expected.index = 10
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T5', () => {
    const re = new Re('\\d{3}|[a-z]{4}')

    const source = '2, 12 and 23 AND 0.00.1'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.3_A1_T6', () => {
    const re = new Re('ab|cd|ef', 'i')

    const source = 'AEKFCD'
    const result = re.match(source)

    const expected: IMatchResult = ['CD']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T7', () => {
    const re = new Re('ab|cd|ef')

    const source = 'AEKFCD'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.3_A1_T8', () => {
    const re = new Re('(?:ab|cd)+|ef', 'i')

    const source = 'AEKFCD'
    const result = re.match(source)

    const expected: IMatchResult = ['CD']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T9', () => {
    const re = new Re('(?:ab|cd)+|ef', 'i')

    const source = 'AEKFCDab'
    const result = re.match(source)

    const expected: IMatchResult = ['CDab']
    expected.index = 4
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T10', () => {
    const re = new Re('(?:ab|cd)+|ef', 'i')

    const source = 'AEKeFCDab'
    const result = re.match(source)

    const expected: IMatchResult = ['eF']
    expected.index = 3
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T11', () => {
    const re = new Re('11111|111')

    const source = '1111111111111111'
    const result = re.match(source)

    const expected: IMatchResult = ['11111']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T12', () => {
    const re = new Re('xyz|...')

    const source = 'abc'
    const result = re.match(source)

    const expected: IMatchResult = ['abc']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T13', () => {
    const re = new Re('(.)..|abc')

    const source = 'abc'
    const result = re.match(source)

    const expected: IMatchResult = ['abc', 'a']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T14', () => {
    const re = new Re('.+: gr(a|e)y')

    const source = 'color: grey'
    const result = re.match(source)

    const expected: IMatchResult = ['color: grey', 'e']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T15', () => {
    const re = new Re('(Rob)|(Bob)|(Robert)|(Bobby)')

    const source = 'Hi Bob'
    const result = re.match(source)

    const expected: IMatchResult = [
        'Bob',
        undefined,
        'Bob',
        undefined,
        undefined
    ]
    expected.index = 3
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T16', () => {
    const re = new Re('()|')

    const source = ''
    const result = re.match(source)

    const expected: IMatchResult = ['', '']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.3_A1_T17', () => {
    const re = new Re('|()')

    const source = ''
    const result = re.match(source)

    const expected: IMatchResult = ['', undefined]
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
