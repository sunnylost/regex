import Parse from './parse'
import { MatchResult, Matcher } from '../types'

const FLAGS_ACRONYM = {
    g: 'global',
    i: 'ignoreCase',
    m: 'multiline',
    s: 'sticky'
}

class Re {
    pattern: string
    flags: string
    lastIndex: number
    processState: number
    traceStack: any[]
    states: Matcher[]
    source: string
    groups: object

    constructor(pattern: string, flags?: string) {
        this.pattern = pattern
        this.flags = flags || ''
        this.lastIndex = 0
        this.processState = 0 // TODO: 0-normal, 1-backtracking
        this.traceStack = []
        this.parseFlags()
        this.parseStates()
    }

    parseFlags() {
        let flags = this.flags

        for (let i = 0; i < flags.length; i++) {
            let f = flags[i]

            if (FLAGS_ACRONYM[f]) {
                this[FLAGS_ACRONYM[f]] = true
            } else {
                console.error(`"${f}" is not a valid flag`)
            }
        }
    }

    parseStates() {
        ;({ states: this.states, groups: this.groups } = Parse(this.pattern))
    }

    match(source) {
        if (!source) {
            return null
        }

        this.source = source
        let states = this.states
        let matchResult = []
        let len = source.length
        let i = 0

        Loop: for (; i < len; i++) {
            let preMatchedIndex = i

            matchResult.length = 0

            for (let j = 0; j < states.length; j++) {
                let state = states[j]
                let result = state.execute(this, preMatchedIndex)
                // debugger
                if (!result.isMatched) {
                    matchResult.length = 0
                    continue Loop
                } else {
                    preMatchedIndex += result.matchedStr.length
                    matchResult.push(result.matchedStr)
                }
            }

            //TODO: [] condition
            if (matchResult.length === states.length) {
                break Loop
            }
        }

        //TODO: groups, global
        if (matchResult.length) {
            let result: MatchResult = [matchResult.join('')]

            if (this.groups) {
                Object.values(this.groups).forEach(v => {
                    let r = v.matchResult
                    result.push(r && r.isMatched ? r.matchedStr : undefined)
                })
            }

            result.index = i
            result.input = source
            return result
        } else {
            return null
        }
    }

    test(source) {
        let result = this.match(source)

        return !!(result && result.length)
    }
}

export default Re