import { test, expect } from 'bun:test'
import Re from '../../src'
import { IMatchResult } from '../../types'

test('15.10.2.5_A1_T1', () => {
    const re = new Re('a[a-z]{2,4}')

    const source = 'abcdefghi'
    const result = re.match(source)

    const expected: IMatchResult = ['abcde']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.5_A1_T2', () => {
    const re = new Re('a[a-z]{2,4}?')

    const source = 'abcdefghi'
    const result = re.match(source)

    const expected: IMatchResult = ['abc']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.5_A1_T3', () => {
    const re = new Re('(aa|aabaac|ba|b|c)*')

    const source = 'aabaac'
    const result = re.match(source)

    const expected: IMatchResult = ['aaba', 'ba']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.5_A1_T4', () => {
    const re = new Re('(z)((a+)?(b+)?(c))*')

    const source = 'zaacbbbcac'
    const result = re.match(source)

    const expected: IMatchResult = [
        'zaacbbbcac',
        'z',
        'ac',
        'a',
        undefined,
        'c'
    ]
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.5_A1_T5', () => {
    const re = new Re('(a*)b\\1+')

    const source = 'baaaac'
    const result = re.match(source)

    const expected: IMatchResult = ['b', '']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
