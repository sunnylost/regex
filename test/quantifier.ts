import Re from '../src'
import { MatchResult } from '../types'

test('15.10.2.5_A1_T1', () => {
    let re = new Re('a[a-z]{2,4}')
    let source = 'abcdefghi'
    let result = re.match(source)

    let expected: MatchResult = ['abcde']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.5_A1_T2', () => {
    let re = new Re('a[a-z]{2,4}?')
    let source = 'abcdefghi'
    let result = re.match(source)

    let expected: MatchResult = ['abc']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.5_A1_T3', () => {
    let re = new Re('(aa|aabaac|ba|b|c)*')
    let source = 'aabaac'
    let result = re.match(source)

    let expected: MatchResult = ['aaba', 'ba']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})

test('15.10.2.5_A1_T4', () => {
    let re = new Re('(z)((a+)?(b+)?(c))*')
    let source = 'zaacbbbcac'
    let result = re.match(source)

    let expected: MatchResult = ['zaacbbbcac', 'z', 'ac', 'a', undefined, 'c']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
