import { test, expect } from 'bun:test'
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
test('15.10.2.6_A3_T1', () => {
    const re = new Re('\\bp')

    const source = 'pilot\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['p']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T2', () => {
    const re = new Re('ot\\b')

    const source = 'pilot\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['ot']
    expected.index = 3
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T3', () => {
    const re = new Re('\\bot')

    const source = 'pilot\nsoviet robot\topenoffice'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A3_T4', () => {
    const re = new Re('\\bso')

    const source = 'pilot\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['so']
    expected.index = 6
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T5', () => {
    const re = new Re('so\\b')

    const source = 'pilot\nsoviet robot\topenoffice'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A3_T6', () => {
    const re = new Re('[^o]t\\b')

    const source = 'pilOt\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['Ot']
    expected.index = 3
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T7', () => {
    const re = new Re('[^o]t\\b', 'i')

    const source = 'pilOt\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['et']
    expected.index = 10
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T8', () => {
    const re = new Re('\\bro')

    const source = 'pilot\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['ro']
    expected.index = 13
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T9', () => {
    const re = new Re('r\\b')

    const source = 'pilot\nsoviet robot\topenoffice'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A3_T10', () => {
    const re = new Re('\\brobot\\b')

    const source = 'pilot\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['robot']
    expected.index = 13
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T11', () => {
    const re = new Re('\\b\\w{5}\\b')

    const source = 'pilot\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['pilot']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T12', () => {
    const re = new Re('\\bop')

    const source = 'pilot\nsoviet robot\topenoffice'
    const result = re.match(source)

    const expected: IMatchResult = ['op']
    expected.index = 19
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T13', () => {
    const re = new Re('op\\b')

    const source = 'pilot\nsoviet robot\topenoffice'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A3_T14', () => {
    const re = new Re('e\\b')

    const source = 'pilot\nsoviet robot\topenoffic\u0065'
    const result = re.match(source)

    const expected: IMatchResult = ['e']
    expected.index = 28
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A3_T15', () => {
    const re = new Re('\\be')

    const source = 'pilot\nsoviet robot\topenoffic\u0065'
    expect(re.test(source)).toBe(false)
})
test('15.10.2.6_A4_T1', () => {
    const re = new Re('\\Bevil\\B')

    const source = 'devils arise\tfor\nevil'
    const result = re.match(source)

    const expected: IMatchResult = ['evil']
    expected.index = 1
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A4_T2', () => {
    const re = new Re('[f-z]e\\B')

    const source = 'devils arise\tfor\nrevil'
    const result = re.match(source)

    const expected: IMatchResult = ['re']
    expected.index = 17
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A4_T3', () => {
    const re = new Re('\\Bo\\B', 'i')

    const source = 'devils arise\tfOr\nrevil'
    const result = re.match(source)

    const expected: IMatchResult = ['O']
    expected.index = 14
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A4_T4', () => {
    const re = new Re('\\B\\w\\B')

    const source = 'devils arise\tfor\nrevil'
    const result = re.match(source)

    const expected: IMatchResult = ['e']
    expected.index = 1
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A4_T5', () => {
    const re = new Re('\\w\\B')

    const source = 'devils arise\tfor\nrevil'
    const result = re.match(source)

    const expected: IMatchResult = ['d']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A4_T6', () => {
    const re = new Re('\\B\\w')

    const source = 'devils arise\tfor\nrevil'
    const result = re.match(source)

    const expected: IMatchResult = ['e']
    expected.index = 1
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A4_T7', () => {
    const re = new Re('\\B[^z]{4}\\B')

    const source = 'devil arise\tforzzx\nevils'
    const result = re.match(source)

    const expected: IMatchResult = ['il a']
    expected.index = 3
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A4_T8', () => {
    const re = new Re('\\B\\w{4}\\B')

    const source = 'devil arise\tforzzx\nevils'
    const result = re.match(source)

    const expected: IMatchResult = ['orzz']
    expected.index = 13
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A5_T1', () => {
    const re = new Re('^^^^^^^robot$$$$')

    const source = 'robot'
    const result = re.match(source)

    const expected: IMatchResult = ['robot']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A5_T2', () => {
    const re = new Re('\\B\\B\\B\\B\\B\\Bbot\\b\\b\\b\\b\\b\\b\\b')

    const source = 'robot wall-e'
    const result = re.match(source)

    const expected: IMatchResult = ['bot']
    expected.index = 2
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A6_T1', () => {
    const re = new Re('^.*?$')

    const source = 'Hello World'
    const result = re.match(source)

    const expected: IMatchResult = ['Hello World']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A6_T2', () => {
    const re = new Re('^.*?')

    const source = 'Hello World'
    const result = re.match(source)

    const expected: IMatchResult = ['']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A6_T3', () => {
    const re = new Re('^.*?(:|$)')

    const source = 'Hello: World'
    const result = re.match(source)

    const expected: IMatchResult = ['Hello:', ':']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
test('15.10.2.6_A6_T4', () => {
    const re = new Re('^.*(:|$)')

    const source = 'Hello: World'
    const result = re.match(source)

    const expected: IMatchResult = ['Hello: World', '']
    expected.index = 0
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
})
