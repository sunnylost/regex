import Re from '../../src'
import { IMatchResult } from '../../types'

test('15.10.2.7_A1_T1', () => {
    const re = new Re('\\d{2,4}')

    const source = 'the answer is 42'
    const result = re.match(source)

    const expected: IMatchResult = ['42']
    expected.index = 14
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.7_A1_T2', () => {
    const re = new Re('\\d{2,4}')

    const source = 'the 7 movie'
    expect(re.test(source)).toBe(false)
})
