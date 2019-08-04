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
    traceStack: Matcher[]
    states: Matcher[]
    source: string
    groups: object

    constructor(pattern: string, flags?: string) {
        this.pattern = pattern
        this.flags = flags || ''
        this.lastIndex = 0
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
        this.source = source
        let states = this.states
        let traceStack = this.traceStack
        let matchResult = []
        let len = Math.max(source.length, 1)
        let i = 0

        Loop: for (; i < len; i++) {
            let preMatchedIndex = i

            matchResult.length = traceStack.length = 0

            for (let j = 0; j < states.length; j++) {
                let state = states[j]
                state.index = j
                state.preMatchedIndex = preMatchedIndex
                state.preMatchResult = [...matchResult]

                let result = state.execute(this, preMatchedIndex)

                if (!result.isMatched) {
                    if (traceStack.length) {
                        let lastMatcher = traceStack[traceStack.length - 1]
                        lastMatcher.isTraceback = true
                        j = lastMatcher.index - 1
                        preMatchedIndex = lastMatcher.preMatchedIndex
                        matchResult = [...lastMatcher.preMatchResult]
                        debugger
                        continue
                    } else {
                        continue Loop
                    }
                } else {
                    preMatchedIndex += result.matchedStr.length
                    matchResult.push(result.matchedStr)
                }
            }

            //TODO: [] condition
            if (matchResult.length === states.length) {
                break
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
