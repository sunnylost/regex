import { TYPE_CHAR, TYPE_DOT, TYPE_SET } from './key'

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
        this.index = index
        this.lastCheckIndex = 0
    }

    execute(config, index = 0) {
        let str = config.source
        let isMatched = false
        let _index = 0
        let matchedStr

        let lastCheckIndex = (this.lastCheckIndex = index)

        switch (this.type) {
            case TYPE_CHAR:
                let sourceStr = str.substring(
                    lastCheckIndex,
                    lastCheckIndex + this.value.length
                )
                let checkStr = this.value

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
                let checkChar = str[lastCheckIndex]
                isMatched = this.children.some(v => {
                    let result = v(checkChar)

                    if (isNegative) {
                        if (!result) {
                            return true
                        }
                    } else {
                        if (result) {
                            return true
                        }
                    }
                })

                if (isMatched) {
                    matchedStr = checkChar
                }
                break

            case TYPE_DOT:
                break
        }

        return {
            isMatched,
            config,
            matchedStr,
            index: _index
        }
    }
}

export default Matcher
