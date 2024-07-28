import { Glob } from 'bun'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { load } from 'js-yaml'
import { format as prettify } from 'prettier'

const updateRecordFilePath = './unit-test-generate-info'
const updateRecordFileName = 'info.json'
const PREFIX = `
import { test, expect } from 'bun:test'
import Re from '../../src'
import { IMatchResult } from '../../types'
`
const testRootPath = resolve(__dirname, '../')
let lastUpdateTime = {}

function resolveFromTest(...path: string[]) {
    return resolve(testRootPath, ...path)
}

const prettierrc = JSON.parse(
    readFileSync(resolveFromTest('./.prettierrc'), 'utf8')
)

async function generateContent(data) {
    const content = []
    data.forEach((unit) => {
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

    return prettify(PREFIX + '\n' + content.join('\n'), prettierrc)
}

function loadLastUpdateTime() {
    return new Promise((resolve) => {
        try {
            const recordFileContent = readFileSync(
                resolveFromTest(updateRecordFilePath, updateRecordFileName),
                'utf8'
            )

            if (recordFileContent) {
                lastUpdateTime = JSON.parse(recordFileContent)
            }

            resolve(true)
        } catch {
            resolve(true)
        }
    })
}

function updateLastUpdateTime() {
    const fileName = resolveFromTest(updateRecordFilePath, updateRecordFileName)
    const dir = dirname(fileName)

    try {
        mkdirSync(dir)
    } catch (err) {
        console.log(err)
    }

    writeFileSync(fileName, JSON.stringify(lastUpdateTime, null, '  '), 'utf8')
}

const glob = new Glob('sources/*.yaml')

async function generate() {
    for await (const file of glob.scan('./test')) {
        const arr = file.split('/')
        const filename = arr[arr.length - 1].replace('.yaml', '.test.ts')
        const filePath = resolveFromTest(file)
        // TODO: bun stats api not implemented
        const modifyTime = '' + Date.now()

        if (lastUpdateTime[filename] !== modifyTime) {
            lastUpdateTime[filename] = modifyTime

            const doc = load(readFileSync(filePath, 'utf8')) as string

            if (doc) {
                const content = await generateContent(doc)

                writeFileSync(
                    resolveFromTest(`./unit/${filename}`),
                    content,
                    'utf8'
                )
            }
        }
    }

    updateLastUpdateTime()
}

loadLastUpdateTime().then(generate)
