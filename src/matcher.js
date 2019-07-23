import { TYPE_CHAR, TYPE_DOT, TYPE_GROUP, TYPE_OR, TYPE_SET } from './key'

let isDotMatched = c => {
    return c !== '\n' && c !== '\r' && c !== '\u2028' && c !== '\u2029'
}

class Matcher {
    constructor({
        type = '',
        value = '',
        children = [],
        parent = null,
        isNegate = false,
        isFirst = false,
        isLast = false,
        isInRange = false,
        isZeroOrOnce = false,
        isZeroOrMulti = false,
        isOnceOrMulti = false,
        isGreedy = false,
        groupIndex = '',
        index = 1
    }) {
        this.type = type
        this.value = value
        this.children = children
        this.parent = parent
        this.isFirst = isFirst
        this.isLast = isLast
        this.isNegate = isNegate
        this.isInRange = isInRange
        this.isZeroOrOnce = isZeroOrOnce
        this.isZeroOrMulti = isZeroOrMulti
        this.isOnceOrMulti = isOnceOrMulti
        this.isGreedy = isGreedy
        this.groupIndex = groupIndex
        this.index = index
        this.lastCheckIndex = 0
    }

    execute(config, index = 0) {
        let str = config.source
        let isMatched = false
        let _index = 0
        let matchedStr

        let lastCheckIndex = (this.lastCheckIndex = index)
        let children = this.children
        let childrenLen = children.length
        let checkStr
        let checkChar
        // debugger
        switch (this.type) {
            case TYPE_CHAR:
                let sourceStr = str.substring(
                    lastCheckIndex,
                    lastCheckIndex + this.value.length
                )
                checkStr = this.value

                if (config.ignoreCase) {
                    sourceStr = sourceStr.toLowerCase()
                    checkStr = checkStr.toLowerCase()
                }

                if (sourceStr === checkStr) {
                    isMatched = true
                    _index = index + this.value.length
                    matchedStr = checkStr
                } else {
                    isMatched = false
                    _index = index
                }

                break

            case TYPE_SET:
                let isNegative = this.isNegate
                checkChar = str[lastCheckIndex]

                for (let i = 0; i < childrenLen; i++) {
                    let matcher = children[i]
                    let result = matcher(checkChar)

                    if ((isNegative && !result) || result) {
                        //match
                        matchedStr = checkChar
                        break
                    }
                }

                break

            case TYPE_OR:
                for (let i = 0; i < childrenLen; i++) {
                    let matcher = children[i]
                    let result = matcher.execute(config, lastCheckIndex)

                    if (result.isMatched) {
                        isMatched = true
                        matchedStr = result.matchedStr
                        break
                    }
                }
                break

            case TYPE_DOT:
                checkChar = str[lastCheckIndex]

                if (isDotMatched(checkStr)) {
                    isMatched = true
                    matchedStr = checkChar
                }
                break

            case TYPE_GROUP:
                for (let i = 0; i < childrenLen; i++) {
                    let matcher = children[i]
                    let result = matcher.execute(config, lastCheckIndex)
                    // debugger
                    if (result.isMatched) {
                        isMatched = true
                        matchedStr = (matchedStr || '') + result.matchedStr
                        lastCheckIndex += result.matchedStr.length
                        break
                    } else {
                        isMatched = false
                        matchedStr = undefined
                        break
                    }
                }
                break
        }

        return (this.__matchResult = {
            isMatched,
            config,
            matchedStr,
            index: _index
        })
    }
}

export default Matcher
