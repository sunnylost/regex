let yaml = require('js-yaml')
let fs = require('fs')
let { resolve } = require('path')
let glob = require('glob')
let prettier = require('prettier')
let prettierrc = JSON.parse(
    fs.readFileSync(resolve(__dirname, '../../.prettierrc'), 'utf8')
)

const PREFIX = `
import Re from '../../src'
import { IMatchResult } from '../../types'
`

function generateContent(data) {
    let content = []
    data.forEach(unit => {
        Object.entries(unit).forEach(([k, v]) => {
            content.push(`test('${k}', () => {`)
            // console.log(v)
            let re = v[0]
            let match = v[1]

            content.push(`let re = new Re('${re[0]}'`)

            if (re.length > 1) {
                content.push(`, '${re[1]}')`)
            } else {
                content.push(')')
            }

            if (match.length === 1) {
                let source = match[0]

                content.push(`
    let source = '${source}'
    expect(re.test(source)).toBe(false)`)
            } else {
                let [source, matchResult, index] = match

                matchResult.forEach((m, i) => {
                    matchResult[i] = m === 'undefined' ? 'undefined' : `'${m}'`
                })

                content.push(`
    let source = '${source}'
    let result = re.match(source)

    let expected: IMatchResult = [${matchResult}]
    expected.index = ${index}
    expected.input = source

    expect(result.length).toBe(expected.length)
    expect(result.index).toBe(expected.index)
    expect(result).toEqual(expected)
                `)
            }

            content.push('})')
        })
    })

    return prettier.format(PREFIX + '\n' + content.join('\n'), prettierrc)
}

glob('../sources/*.yaml', (err, files) => {
    if (err) {
        return console.error(err)
    }

    files.forEach(v => {
        let arr = v.split('/')
        let filename = arr[arr.length - 1].replace('.yaml', '.ts')
        let filePath = resolve(__dirname, v)
        let doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))

        if (doc) {
            let content = generateContent(doc)

            fs.writeFileSync(
                resolve(__dirname, `../unit/${filename}`),
                content,
                'utf8'
            )
        }
    })
})
