import Type from './key'
import { IMatcher } from '../types'

let isDotMatched = c => {
    return c !== '\n' && c !== '\r' && c !== '\u2028' && c !== '\u2029'
}

let isNumber = c => {
    let code = c.charCodeAt(0)
    return code >= 48 && code <= 57
}

let specialCharMatcher = {
    d: isNumber
}

function merge(leastMatch, localMatch) {
    let matchedStr =
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

class Matcher implements IMatcher {
    type
    value
    isRoot = false
    children
    parent = null
    isFirst = false
    isLast = false
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

    constructor({
        type,
        value = '',
        children = [],
        parent = null,
        isNegative = false,
        isRoot,
        isFirst = false,
        isLast = false,
        isGreedy = true,
        groupIndex,
        index = 1
    }: any) {
        this.type = type
        this.value = value
        this.children = children
        this.parent = parent
        this.isRoot = isRoot
        this.isFirst = isFirst
        this.isLast = isLast
        this.isNegative = isNegative
        this.isGreedy = isGreedy
        this.groupIndex = groupIndex
        this.index = index
        this.lastCheckIndex = 0
        this.localTrackStack = []
    }

    execute(config, index = 0) {
        let isTraceback = config.isTraceback
        let traceStack = config.traceStack
        let localTrackStack = []
        let quantifier = this.quantifier

        if (!quantifier) {
            return this.match(config, index)
        }

        let min = quantifier.min
        let max = quantifier.max
        let offset = max - min

        //TODO
        if (this.isGreedy) {
            // debugger
            if (!isTraceback) {
                // debugger
                let leastMatchResult = (this.leastMatchResult = {
                    isMatched: !min, // min === 0 means match
                    matchedStr: '',
                    groupMatchedStr: '',
                    index
                })

                while (min--) {
                    let result = this.match(config, index)

                    if (result.isMatched) {
                        index += result.matchedStr.length
                        leastMatchResult.isMatched = true
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
                    let result = this.match(config, index)

                    if (result.isMatched) {
                        localTrackStack.push(result)
                        index += result.matchedStr
                            ? result.matchedStr.length
                            : 1
                        min++
                    } else {
                        break
                    }
                }

                if (localTrackStack.length) {
                    if (traceStack.indexOf(this)) {
                        traceStack.splice(traceStack.indexOf(this), 1)
                    }
                    traceStack.push(this)
                    this.localTrackStack = localTrackStack
                    return (this.matchResult = merge.call(
                        this,
                        leastMatchResult,
                        localTrackStack
                    ))
                } else {
                    return leastMatchResult
                }
            } else {
                //TODO
                localTrackStack = this.localTrackStack
                if (localTrackStack.length) {
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
            }
        } else {
            if (!isTraceback) {
                if (min === 0) {
                    traceStack.push({
                        matcher: this
                    })
                    return (this.matchResult = {
                        isMatched: true,
                        config,
                        matchedStr: '',
                        groupMatchedStr: '',
                        index
                    })
                } else {
                    let leastMatchResult = (this.leastMatchResult = {
                        isMatched: true,
                        matchedStr: '',
                        groupMatchedStr: '',
                        index
                    })

                    while (min--) {
                        let result = this.match(config, index)

                        if (result.isMatched) {
                            index += result.matchedStr.length
                            leastMatchResult.matchedStr += result.matchedStr
                            leastMatchResult.groupMatchedStr =
                                leastMatchResult.matchedStr
                            leastMatchResult.index = index
                        } else {
                            //match failed
                            return {
                                isMatched: false
                            }
                        }
                    }

                    return leastMatchResult
                }
            } else {
                //TODO
            }
        }
    }

    match(config, index = 0) {
        let str = config.source
        let maxIndex = Math.max(str.length, 1)
        let isMatched = false
        let _index = 0
        let matchedStr = ''
        // debugger
        if (index > maxIndex) {
            return {
                isMatched: false
            }
        }

        if (index === maxIndex && this.type !== Type.ASSERT) {
            return {
                isMatched: false
            }
        }

        let lastCheckIndex = (this.lastCheckIndex = index)
        let children = this.children
        let childrenLen = children.length
        let checkStr
        let checkChar
        // debugger
        switch (this.type) {
            case Type.CHAR:
                let sourceStr = str.substring(
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
                let isNegative = this.isNegative
                checkChar = str[lastCheckIndex]

                for (let i = 0; i < childrenLen; i++) {
                    let matcher = children[i]
                    let result = matcher(checkChar)

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
                    let item = children[i]

                    for (let j = 0; j < item.length; j++) {
                        let matcher = item[j]
                        let result = matcher.execute(config, index)

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
                    let matcher = children[i]
                    let result = matcher.execute(config, lastCheckIndex)
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
                        break
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
}

export default Matcher
