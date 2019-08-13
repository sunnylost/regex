import Re from '../../src'
import { IMatchResult } from '../../types'

test('15.10.2.5_A1_T1', () => {
    let re = new Re('a[a-z]{2,4}')

    let source = 'abcdefghi'
    let result = re.match(source)

    let expected: IMatchResult = ['abcde']
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

    let expected: IMatchResult = ['abc']
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

    let expected: IMatchResult = ['aaba', 'ba']
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

    let expected: IMatchResult = ['zaacbbbcac', 'z', 'ac', 'a', undefined, 'c']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.5_A1_T5', () => {
    let re = new Re('(a*)b\\1+')

    let source = 'baaaac'
    let result = re.match(source)

    let expected: IMatchResult = ['b', '']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
