import Parse from './parse'

const FLAGS_ACRONYM = {
    g: 'global',
    i: 'ignoreCase',
    m: 'multiline',
    s: 'sticky'
}

class Re {
    constructor(pattern, flags) {
        this.pattern = pattern
        this.flags = flags || ''
        this.lastIndex = 0
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
        this.states = Parse(this.pattern)
    }

    match(source) {
        if (!source) {
            return null
        }

        this.source = source
        let states = this.states
        let matchResult = []
        let len = source.length

        Loop: for (let i = 0; i < len; i++) {
            for (let j = 0; j < states.length; j++) {
                let state = states[j]
                let result = state.execute(this, i)

                if (!result.isMatched) {
                    continue Loop
                } else {
                    matchResult.push(result.matchedStr)
                }
            }

            //TODO: [] condition
            if (matchResult.length === states.length) {
                break Loop
            }
        }

        //TODO: groups, index
        if (matchResult.length) {
            matchResult.input = source
            return matchResult
        } else {
            return null
        }
    }
}

export default Re
