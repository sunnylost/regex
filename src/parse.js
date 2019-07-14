//type
import { TYPE_GROUP, TYPE_SET, TYPE_DOT, TYPE_OR, TYPE_CHAR } from './key'

const META_CHARACTERS = '()[]{}|^$.*?+-,'
const SET_META_CHARACTERS = '[](){}|$.*?+,'

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
                } else {
                    isMatched = false
                    _index = index
                }

                break

            case TYPE_DOT:
                break
        }

        if (this.children && this.children.length) {
            this.children.forEach(matcher => {
                matcher.execute(config, _index)
            })
        }

        return {
            isMatched,
            config,
            index: _index
        }
    }
}

export default pattern => {
    let len = pattern.length
    let isInCharacterSet = false
    let isNeedTransfer = false
    let captureIndex = 1
    let next = () => {}
    let stack = []
    let matcher = new Matcher({ type: TYPE_CHAR })
    let curMatcher = matcher

    stack.push({
        children: [matcher]
    })
    curMatcher.parent = stack[0]

    for (let i = 0; i < len; i++) {
        let c = pattern[i]

        if (isNeedTransfer && META_CHARACTERS.includes(c)) {
            curMatcher.value += c
            continue
        }

        if (isInCharacterSet && SET_META_CHARACTERS.includes(c)) {
            curMatcher.value += c
            continue
        }

        switch (c) {
            case '(':
                matcher = curMatcher
                curMatcher = new Matcher({
                    type: TYPE_GROUP,
                    parent: matcher,
                    index: captureIndex++
                })
                matcher.parent.children.push(curMatcher)
                break
            case ')':
                curMatcher = curMatcher.parent
                break
            case '[':
                matcher = curMatcher
                curMatcher = new Matcher({ type: TYPE_SET, parent: matcher })
                matcher.children.push(curMatcher)
                isInCharacterSet = true
                break
            case ']':
                curMatcher = curMatcher.parent
                isInCharacterSet = false
                break
            case '{':
                break
            case '}':
                break
            case '|':
                matcher = curMatcher
                curMatcher = new Matcher({
                    type: TYPE_CHAR,
                    parent: matcher.parent
                })
                matcher.parent.children.push(curMatcher)
                break
            case '-':
                if (isInCharacterSet) {
                    if (curMatcher.value.length) {
                        //TODO: not the last
                        curMatcher.isInRange = true
                    } else {
                        curMatcher.value += c
                    }
                } else {
                    curMatcher.value += c
                }
                break
            case '^':
                if (isInCharacterSet) {
                    if (curMatcher.value) {
                        curMatcher.value += c
                    } else {
                        curMatcher.isNegate = true
                    }
                } else {
                    curMatcher.isFirst = true
                }
                break
            case '$':
                curMatcher.isLast = true
                break
            case '+':
                curMatcher.isOnceOrMulti = true
                break
            case '*':
                curMatcher.isZeroOrMulti = true
                break
            case '?':
                curMatcher.isZeroOrOnce = true
                break
            case '\\': //TODO: \\\\
                isNeedTransfer = true
                break
            case '.':
                matcher = curMatcher
                curMatcher = new Matcher({ type: TYPE_DOT, parent: matcher })
                matcher.children.push(curMatcher)
                break
            case ',':
                break
            default:
                if (curMatcher.type === TYPE_CHAR) {
                    curMatcher.value += c
                } else {
                    matcher = curMatcher
                    curMatcher = new Matcher({
                        parent: matcher,
                        type: TYPE_CHAR,
                        value: c
                    })

                    matcher.children.push(curMatcher)
                }
        }

        next()

        if (isNeedTransfer) {
            next = () => {
                isNeedTransfer = false
            }
        } else {
            next = () => {}
        }
    }

    return stack[0].children
}
