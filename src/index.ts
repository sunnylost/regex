import Parse from './parse'
import { IRe, IMatchResult, IMatcher } from '../types'

const FLAGS_ACRONYM = {
    g: 'global',
    i: 'ignoreCase',
    m: 'multiline',
    s: 'sticky'
}

class Re implements IRe {
    pattern
    flags
    lastIndex
    traceStack = []
    states = []
    source = ''
    groups
    isTraceback = false
    global = false
    ignoreCase = false
    multiline = false
    sticky = false

    constructor(pattern: string, flags?: string) {
        this.pattern = pattern
        this.flags = flags || ''
        this.lastIndex = 0
        this.traceStack = []
        this.isTraceback = false
        this.parseFlags()
        this.parseStates()
    }

    parseFlags() {
        const flags = this.flags

        for (let i = 0; i < flags.length; i++) {
            const f = flags[i]

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
        const states = this.states
        const traceStack = this.traceStack
        const matchResult = []
        let previousMatchResult = []
        const len = Math.max(source.length, 1)
        let i = 0

        Loop: for (; i < len; i++) {
            let preMatchedIndex = i

            this.isTraceback = false

            if (this.global && matchResult.length) {
                previousMatchResult = previousMatchResult.concat(
                    matchResult.join('')
                )
            }

            matchResult.length = traceStack.length = 0

            for (let j = 0; j < states.length; j++) {
                const state = states[j]
                const result = state.execute(this, preMatchedIndex)

                // debugger
                if (!result.isMatched) {
                    // debugger
                    matchResult.length = 0
                    preMatchedIndex = i

                    //TODO: when do we need to empty traceStack?
                    //TODO: can global influence backtrace?
                    if (traceStack.length) {
                        this.isTraceback = true
                        j = -1
                    } else {
                        continue Loop
                    }
                } else {
                    preMatchedIndex += result.matchedStr.length
                    matchResult.push(result.matchedStr)
                }
            }

            //TODO: [] condition
            if (!this.global && matchResult.length) {
                break
            }
        }

        //TODO: groups, global
        if (previousMatchResult.length || matchResult.length) {
            if (matchResult.length) {
                previousMatchResult = previousMatchResult.concat(
                    matchResult.join('')
                )
            }

            const result: IMatchResult = [...previousMatchResult]

            if (!this.global) {
                if (this.groups) {
                    Object.values(this.groups).forEach((v: IMatcher) => {
                        const r = v.matchResult
                        result.push(
                            r && r.isMatched ? r.groupMatchedStr : undefined
                        )
                    })
                }

                result.index = i
                result.input = source
            }

            return result
        } else {
            return null
        }
    }

    test(source) {
        const result = this.match(source)

        return !!(result && result.length)
    }
}

export default Re
