import { Type } from './key'
import { IMatcher } from '../types'

const matchCharacters = (cs: string[]) => {
    return (c: string) => {
        for (let i = 0; i < cs.length; i++) {
            const arr = cs[i].split('-')

            if (arr.length === 1) {
                if (arr[0] === c) {
                    return true
                }
            } else {
                if (c >= arr[0] && c <= arr[1]) {
                    return true
                }
            }
        }
        return false
    }
}

const not = (fn) => {
    return function (...args): boolean {
        return !fn.apply(this, args)
    }
}

const isDotMatched = not(matchCharacters(['\n', '\r', '\u2028', '\u2029']))
const isNumber = matchCharacters(['0-9'])
const isAlphanumeric = matchCharacters(['A-Z', 'a-z', '0-9', '_'])

/**
 * TODO:
 *    \b \B
 *    \cX
 *    \xhh
 *    \uhhhh
 *    \u{hhhh}
 */
const specialCharMatcher = {
    0: matchCharacters(['\u0000']),
    b: matchCharacters(['\u0008']), //backspace [\b]
    d: isNumber,
    D: not(isNumber),
    f: matchCharacters(['\u000c']), //form feed
    n: matchCharacters(['\u000a']), //line feed
    r: matchCharacters(['\u000d']), //carriage return
    s: matchCharacters([
        ' ',
        '\f',
        '\n',
        '\r',
        '\t',
        '\v',
        '\u00a0',
        '\u1680',
        '\u2000-\u200a',
        '\u2028',
        '\u2029',
        '\u202f',
        '\u205f',
        '\u3000',
        '\ufeff'
    ]),
    t: matchCharacters(['\u0009']),
    v: matchCharacters(['\u000b']),
    w: isAlphanumeric,
    W: not(isAlphanumeric)
}

function merge(leastMatch, localMatch): object {
    const matchedStr =
        leastMatch.matchedStr +
        localMatch.reduce((a, b) => a + b.matchedStr, '')
    let groupMatchedStr

    if (this.type === Type.GROUP) {
        groupMatchedStr = localMatch.length
            ? localMatch[localMatch.length - 1].matchedStr
            : ''
    } else {
        groupMatchedStr = matchedStr
    }

    return {
        isMatched: true,
        matchedStr,
        groupMatchedStr,
        index: leastMatch.index + localMatch.length
    }
}

function isInWordCharacters(c: string) {
    return (
        (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9') ||
        c === '_'
    )
}

function isContainerType(type: string) {
    return type === Type.GROUP || type === Type.OR
}

export default class Matcher implements IMatcher {
    type
    value
    isRoot = false
    children
    parent = null
    isNegative = false
    isGreedy = true
    isClosed = false
    groupIndex
    index = 0
    lastCheckIndex = 0
    quantifier
    matchResult
    leastMatchResult
    localTrackStack
    preMatchedIndex = 0
    preMatchResult
    matchedCount = 0

    constructor({
        type,
        value = '',
        children = [],
        parent = null,
        isNegative = false,
        isRoot,
        isGreedy = true,
        groupIndex,
        index = 1
    }: any) {
        this.type = type
        this.value = value
        this.children = children
        this.parent = parent
        this.isRoot = isRoot
        this.isNegative = isNegative
        this.isGreedy = isGreedy
        this.groupIndex = groupIndex
        this.index = index
        this.lastCheckIndex = 0
        this.localTrackStack = []
    }

    execute(config, index = 0) {
        //debugger
        if (!this.quantifier) {
            if (config.isTraceback && !isContainerType(this.type)) {
                return this.matchResult
            } else {
                return this.match(config, index)
            }
        } else {
            return this.handleQuantifier(config, index)
        }
    }

    handleQuantifier(config, index) {
        const traceStack = config.traceStack
        const localTrackStack = []
        const quantifier = this.quantifier
        let min = quantifier.min
        const max = quantifier.max
        let offset = max - min
        // debugger

        if (config.isTraceback && traceStack.indexOf(this) !== -1) {
            return this.handleTraceback(config, index)
        } else {
            //TODO
            if (this.isGreedy) {
                // debugger
                const leastMatchResult = (this.leastMatchResult = {
                    isMatched: !min, // min === 0 means match
                    matchedStr: '',
                    groupMatchedStr: '',
                    index
                })

                while (min--) {
                    const result = this.match(config, index)

                    if (result.isMatched) {
                        index += result.matchedStr.length
                        leastMatchResult.isMatched = true
                        leastMatchResult.groupMatchedStr =
                            leastMatchResult.matchedStr += result.matchedStr
                        leastMatchResult.index = index
                    } else {
                        //match failed
                        return {
                            isMatched: false
                        }
                    }
                }

                // debugger
                while (offset--) {
                    const result = this.match(config, index)

                    if (result.isMatched) {
                        localTrackStack.push(result)

                        if (result.matchedStr && result.matchedStr.length) {
                            index += result.matchedStr.length
                        } else {
                            break
                        }
                    } else {
                        break
                    }
                }

                if (localTrackStack.length) {
                    if (traceStack.indexOf(this) !== -1) {
                        traceStack.splice(traceStack.indexOf(this), 1)
                    }

                    traceStack.push(this)
                    this.localTrackStack = localTrackStack
                    this.matchResult = merge.call(
                        this,
                        leastMatchResult,
                        localTrackStack
                    )

                    return this.matchResult
                } else {
                    return leastMatchResult
                }
            } else {
                if (min === 0) {
                    traceStack.push(this)
                    return (this.matchResult = this.leastMatchResult =
                        {
                            isMatched: true,
                            config,
                            matchedStr: '',
                            groupMatchedStr: '',
                            index
                        })
                } else {
                    const leastMatchResult = (this.leastMatchResult = {
                        isMatched: true,
                        matchedStr: '',
                        groupMatchedStr: '',
                        index
                    })

                    while (min--) {
                        const result = this.match(config, index)

                        if (result.isMatched) {
                            this.matchedCount++
                            index += result.matchedStr.length
                            leastMatchResult.matchedStr += result.matchedStr
                            leastMatchResult.groupMatchedStr =
                                leastMatchResult.matchedStr
                            leastMatchResult.index = index
                        } else {
                            this.matchedCount = 0
                            //match failed
                            return {
                                isMatched: false
                            }
                        }
                    }

                    return leastMatchResult
                }
            }
        }
    }

    handleTraceback(config, index) {
        let localTrackStack = []
        const traceStack = config.traceStack

        if (this.isGreedy) {
            // debugger
            //TODO
            localTrackStack = this.localTrackStack

            if (localTrackStack.length) {
                //TODO
                config.isTraceback = false
                localTrackStack.pop()
                return (this.matchResult = merge.call(
                    this,
                    this.leastMatchResult,
                    localTrackStack
                ))
            } else {
                traceStack.splice(traceStack.indexOf(this), 1)
                return (this.matchResult = {
                    isMatched: false,
                    config,
                    index
                })
            }
        } else {
            //TODO: non-greedy traceback
            const leastMatchResult = this.leastMatchResult

            if (this.matchedCount < this.quantifier.max) {
                const result = this.match(config, this.matchedCount + index)
                // debugger
                if (result.isMatched) {
                    config.isTraceback = false
                    this.matchedCount++
                    index += result.matchedStr.length
                    leastMatchResult.matchedStr += result.matchedStr
                    leastMatchResult.groupMatchedStr =
                        leastMatchResult.matchedStr
                    leastMatchResult.index = index
                    return (this.matchResult = leastMatchResult)
                } else {
                    traceStack.splice(traceStack.indexOf(this), 1)
                    this.matchedCount = 0
                    //match failed
                    return {
                        isMatched: false
                    }
                }
            } else {
                return this.matchResult
            }
        }
    }

    match(config, index = 0) {
        const str = config.source
        const children = this.children
        const childrenLen = children.length

        let isMatched = false
        let _index = 0
        let matchedStr = ''
        let lastCheckIndex = (this.lastCheckIndex = index)
        let checkStr
        let checkChar

        // debugger
        switch (this.type) {
            case Type.CHAR:
                const sourceStr = str.substring(
                    lastCheckIndex,
                    lastCheckIndex + this.value.length
                )
                checkStr = this.value

                if (config.ignoreCase) {
                    isMatched =
                        sourceStr.toLowerCase() === checkStr.toLowerCase()
                } else {
                    isMatched = sourceStr === checkStr
                }

                if (isMatched) {
                    _index = index + this.value.length
                    matchedStr = sourceStr
                } else {
                    _index = index
                }

                break

            case Type.SET:
                const isNegative = this.isNegative
                checkChar = str[lastCheckIndex]

                for (let i = 0; i < childrenLen; i++) {
                    const matcher = children[i]
                    let result

                    if (matcher.type === Type.SPECIAL_CHAR) {
                        result = specialCharMatcher[matcher.value](checkChar)
                    } else {
                        result = matcher(checkChar)
                    }

                    if (isNegative) {
                        if (!result) {
                            isMatched = true
                            matchedStr = checkChar
                            break
                        }
                    } else if (result) {
                        isMatched = true
                        matchedStr = checkChar
                        break
                    }
                }

                break

            case Type.OR:
                // debugger
                for (let i = 0; i < childrenLen; i++) {
                    let index = lastCheckIndex
                    matchedStr = ''
                    const item = children[i]

                    for (let j = 0; j < item.length; j++) {
                        const matcher = item[j]
                        const result = matcher.execute(config, index)

                        if (result.isMatched) {
                            isMatched = true
                            matchedStr += result.matchedStr
                            index += result.matchedStr.length
                        } else {
                            isMatched = false
                            matchedStr = ''
                            break
                        }
                    }

                    if (isMatched) {
                        break
                    }
                }

                break

            case Type.DOT:
                checkChar = str[lastCheckIndex]

                if (isDotMatched(checkStr)) {
                    isMatched = true
                    matchedStr = checkChar
                }
                break

            case Type.GROUP:
                for (let i = 0; i < childrenLen; i++) {
                    const matcher = children[i]
                    const result = matcher.execute(config, lastCheckIndex)
                    // debugger
                    if (result.isMatched) {
                        isMatched = true
                        matchedStr = (matchedStr || '') + result.matchedStr
                        lastCheckIndex += result.matchedStr.length
                    } else {
                        isMatched = false
                        matchedStr = undefined
                        break
                    }
                }
                break

            case Type.SPECIAL_CHAR:
                checkChar = str[lastCheckIndex]
                isMatched = specialCharMatcher[this.value](checkChar)

                if (isMatched) {
                    matchedStr = checkChar
                }
                break

            case Type.EMPTY:
                checkChar = str[lastCheckIndex]

                if (typeof checkChar === 'undefined') {
                    isMatched = true
                    matchedStr = ''
                }
                break

            case Type.ASSERT:
                switch (this.value) {
                    case '$':
                        if (config.multiline) {
                            if (str[lastCheckIndex] === '\n') {
                                isMatched = true
                            }
                        }

                        if (config.source.length === lastCheckIndex) {
                            isMatched = true
                        }

                        break

                    case '^':
                        //TODO
                        if (config.multiline) {
                            if (str[lastCheckIndex - 1] === '\n') {
                                isMatched = true
                            }
                        }

                        //TODO
                        if (!lastCheckIndex) {
                            isMatched = true
                        }
                        break

                    //TODO
                    case 'b':
                        isMatched =
                            isInWordCharacters(str[lastCheckIndex - 1]) !==
                            isInWordCharacters(str[lastCheckIndex])
                        break

                    case 'B':
                        isMatched =
                            isInWordCharacters(str[lastCheckIndex - 1]) ===
                            isInWordCharacters(str[lastCheckIndex])
                        break
                }

                break

            //TODO
            case Type.REFERENCE:
                const group = config.groups[this.value]

                if (!group) {
                    isMatched = true
                } else {
                    matchedStr = group.matchResult.groupMatchedStr || ''
                    isMatched =
                        matchedStr ===
                        str.substring(
                            lastCheckIndex,
                            lastCheckIndex + matchedStr.length
                        )
                }
                break
        }

        return (this.matchResult = {
            isMatched,
            config,
            matchedStr,
            groupMatchedStr: matchedStr,
            index: _index
        })
    }

    //For Test
    toString(): string {
        const quantifierToString = (): string => {
            const q = this.quantifier
            let str = ''

            if (q) {
                const { min, max } = q

                if (min === 0 && max === 1) {
                    str += '?'
                } else if (min === 0 && max === Infinity) {
                    str += '*'
                } else if (min === 1 && max === Infinity) {
                    str += '+'
                } else {
                    str += `{${min || 0},${max || ''}`
                }

                if (!this.isGreedy) {
                    str += '?'
                }
            }

            return str
        }

        switch (this.type) {
            case Type.CHAR:
            case Type.ASSERT:
            case Type.DOT:
                return this.value + quantifierToString()

            case Type.GROUP:
                return (
                    '(' +
                    this.children.map((v) => v.toString()).join('') +
                    ')' +
                    quantifierToString()
                )

            default:
                return 'not implement:' + this.type
        }
    }
}
