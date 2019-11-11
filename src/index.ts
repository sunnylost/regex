import Parse from './parse'
import { IRe, IMatchResult, IMatcher } from '../types'

const FLAGS_ACRONYM = {
    g: 'global',
    i: 'ignoreCase',
    m: 'multiline',
    s: 'dotAll',
    y: 'sticky'
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
    dotAll = false
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
        const len = Math.max(source.length, 1)
        let i = 0
        let preMatchedIndex = 0
        let previousMatchResult = []

        Loop: for (; i < len; ) {
            // debugger
            this.isTraceback = false

            if (this.global && matchResult.length) {
                previousMatchResult = previousMatchResult.concat(
                    matchResult.join('')
                )
            }

            matchResult.length = traceStack.length = 0

            for (let j = 0; j < states.length; j++) {
                const state = states[j]
                const result = state.execute(this, i)

                // debugger
                if (!result.isMatched) {
                    // debugger
                    matchResult.length = 0

                    //TODO: when do we need to empty traceStack?
                    //TODO: can global influence backtrace?
                    if (traceStack.length) {
                        this.isTraceback = true
                        i = preMatchedIndex
                        j = -1
                    } else {
                        ++i
                        continue Loop
                    }
                } else {
                    i += result.matchedStr.length
                    matchResult.push(result.matchedStr)
                }
            }

            if (matchResult.length) {
                preMatchedIndex = i - matchResult.join('').length
            }
            //TODO: [] condition
            // debugger
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

            if (!this.global && this.groups) {
                Object.values(this.groups).forEach((v: IMatcher) => {
                    const r = v.matchResult
                    result.push(
                        r && r.isMatched ? r.groupMatchedStr : undefined
                    )
                })
            }

            result.index = preMatchedIndex
            result.input = source

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
