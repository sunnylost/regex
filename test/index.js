let Re = require('../index')

function randomStr(avoidStr) {
    let maxLen = 10
    let str = ''

    for (let i = 0; i < maxLen; i++) {
        str += String.fromCharCode(97 + Math.floor(26 * Math.random()))
    }

    return str
}

test('single character', () => {
    let matchedCharacter = 'a'
    let re = new Re(matchedCharacter)
    expect(re.match(matchedCharacter)).toContain(matchedCharacter)
})

test('multiple character', () => {
    let matchedCharacter = randomStr()
    let re = new Re(matchedCharacter)
    expect(re.match(matchedCharacter)).toContain(matchedCharacter)
    expect(re.match(randomStr(matchedCharacter) + matchedCharacter)).toContain(
        matchedCharacter
    )
    expect(re.match(matchedCharacter) + randomStr(matchedCharacter)).toContain(
        matchedCharacter
    )
})

test('no match', () => {
    let matchedCharacter = 'a'
    let re = new Re(matchedCharacter)
    expect(re.match('x')).toBe(null)
})
