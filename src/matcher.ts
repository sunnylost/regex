import Type from './key'

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

function merge(mA, mB) {
    return {
        isMatched: true,
        matchedStr: mA.matchedStr + mB.matchedStr,
        index: mB.index
    }
}

class Matcher implements Matcher {
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

    constructor({
        type,
        value = '',
        children = [],
        parent = null,
        isNegative = false,
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
        this.isFirst = isFirst
        this.isLast = isLast
        this.isNegative = isNegative
        this.isGreedy = isGreedy
        this.groupIndex = groupIndex
        this.index = index
        this.lastCheckIndex = 0
    }

    execute(config, index = 0) {
        let processState = config.processState
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
            if (processState === 0) {
                // debugger
                let leastMatchResult = {
                    isMatched: true,
                    matchedStr: '',
                    index
                }

                while (min--) {
                    let result = this.match(config, index)

                    if (result.isMatched) {
                        index += result.matchedStr.length
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
                        index += result.matchedStr.length
                        min++
                    } else {
                        if (localTrackStack.length) {
                            return merge(
                                leastMatchResult,
                                localTrackStack.pop()
                            )
                        } else {
                            return leastMatchResult
                        }
                    }
                }

                return leastMatchResult
            } else {
                //TODO
            }
        } else {
            if (min === 0) {
                traceStack.push({
                    matcher: this
                })
                return (this.matchResult = {
                    isMatched: true,
                    config,
                    matchedStr: '',
                    index
                })
            }
        }
    }

    match(config, index = 0) {
        let str = config.source
        let maxIndex = str.length
        let isMatched = false
        let _index = 0
        let matchedStr
        // debugger
        if (index >= maxIndex) {
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

                    if ((isNegative && !result) || result) {
                        //match
                        isMatched = true
                        matchedStr = checkChar
                        break
                    }
                }

                break

            case Type.OR:
                // debugger
                for (let i = 0; i < childrenLen; i++) {
                    matchedStr = ''
                    let item = children[i]

                    for (let j = 0; j < item.length; j++) {
                        let matcher = item[j]
                        let result = matcher.execute(config, lastCheckIndex)

                        if (result.isMatched) {
                            isMatched = true
                            matchedStr += result.matchedStr
                            lastCheckIndex += result.matchedStr.length
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
        }

        return (this.matchResult = {
            isMatched,
            config,
            matchedStr,
            index: _index
        })
    }
}

export default Matcher
