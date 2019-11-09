const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const { resolve } = require('path')
const glob = require('glob')
const prettier = require('prettier')
const prettierrc = JSON.parse(
    fs.readFileSync(resolve(__dirname, '../../.prettierrc'), 'utf8')
)
const updateRecordFilePath = '../../unit-test-generate-info'
const updateRecordFileName = 'info.json'
let lastUpdateTime = {}

const PREFIX = `
import Re from '../../src'
import { IMatchResult } from '../../types'
`

function generateContent(data) {
    const content = []
    data.forEach(unit => {
        Object.entries(unit).forEach(([k, v]) => {
            content.push(`test('${k}', () => {`)
            // console.log(v)
            const re = v[0]
            const match = v[1]

            content.push(`const re = new Re('${re[0]}'`)

            if (re.length > 1) {
                content.push(`, '${re[1]}')`)
            } else {
                content.push(')')
            }

            if (match.length === 1) {
                const source = match[0]

                content.push(`
    const source = '${source}'
    expect(re.test(source)).toBe(false)`)
            } else {
                const [source, matchResult, index] = match

                matchResult.forEach((m, i) => {
                    matchResult[i] = m === 'undefined' ? 'undefined' : `'${m}'`
                })

                content.push(`
    const source = '${source}'
    const result = re.match(source)

    const expected: IMatchResult = [${matchResult}]
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

function loadLastUpdateTime() {
    return new Promise(res => {
        try {
            const recordFileContent = fs.readFileSync(
                resolve(__dirname, updateRecordFilePath, updateRecordFileName),
                'utf8'
            )

            if (recordFileContent) {
                lastUpdateTime = JSON.parse(recordFileContent)
            }

            res()
        } catch (e) {
            res()
        }
    })
}

function updateLastUpdateTime() {
    const fileName = resolve(
        __dirname,
        updateRecordFilePath,
        updateRecordFileName
    )
    const dir = path.dirname(fileName)

    try {
        fs.statSync(dir)
    } catch (e) {
        fs.mkdirSync(dir)
    }

    fs.writeFileSync(
        fileName,
        JSON.stringify(lastUpdateTime, null, '  '),
        'utf8'
    )
}

function generate() {
    glob('../sources/*.yaml', (err, files) => {
        if (err) {
            return console.error(err)
        }

        files.forEach(v => {
            const arr = v.split('/')
            const filename = arr[arr.length - 1].replace('.yaml', '.ts')
            const filePath = resolve(__dirname, v)
            const modifyTime = '' + fs.statSync(filePath).mtimeMs

            if (lastUpdateTime[filename] !== modifyTime) {
                lastUpdateTime[filename] = modifyTime

                const doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))

                if (doc) {
                    const content = generateContent(doc)

                    fs.writeFileSync(
                        resolve(__dirname, `../unit/${filename}`),
                        content,
                        'utf8'
                    )
                }
            }
        })

        updateLastUpdateTime()
    })
}

loadLastUpdateTime().then(generate)
