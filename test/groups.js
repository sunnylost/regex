import Re from '../src'

test('group', () => {
    let re = new Re('((a)|(ab))((c)|(bc))')
    let result = re.match('abc')

    let expected = ['abc', 'a', 'a', undefined, 'bc', undefined, 'bc']
    expected.index = 0

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)

    for (let i = 0; i < expected.length; i++) {
        expect(result[i]).toBe(expected[i])
    }
})
