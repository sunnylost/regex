//type
import { TYPE_GROUP, TYPE_SET, TYPE_DOT, TYPE_OR, TYPE_CHAR } from './key'
import Matcher from './matcher'

const META_CHARACTERS = '()[]{}|^$.*?+-,'
const SET_META_CHARACTERS = '[](){}|$.*?+,'

function spreadSet(matcher) {
    if (
        matcher.type !== TYPE_SET ||
        !matcher.children ||
        !matcher.children.length
    ) {
        return
    }

    let chars = matcher.children[0].value
    let newChildren = []

    for (let i = 0; i < chars.length; i++) {
        let c = chars[i]

        if (c !== '-' || i === 0) {
            newChildren.push(v => v === c)
        } else {
            newChildren.pop()
            let a = chars[i - 1]
            let b = chars[i + 1] ? chars[i + 1].charCodeAt(1) : Infinity
            newChildren.push(v => v.charCodeAt(0) >= a && v.charCodeAt(0) <= b)

            i += 1
        }
    }

    matcher.children = newChildren
}

/**
 * construct a matcher tree
 * @param pattern
 * @returns {Array}
 */
export default pattern => {
    let len = pattern.length
    let isInCharacterSet = false
    let isNeedTransfer = false
    let captureIndex = 1
    let next = () => {}
    let stack = [
        {
            children: []
        }
    ]
    let curMatcher = stack[0]
    let matcher

    for (let i = 0; i < len; i++) {
        let c = pattern[i]

        if (isNeedTransfer && META_CHARACTERS.includes(c)) {
            curMatcher.value += c
            continue
        }

        if (isInCharacterSet && c !== ']' && SET_META_CHARACTERS.includes(c)) {
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
                matcher = new Matcher({ type: TYPE_CHAR, parent: curMatcher })
                curMatcher.children.push(matcher)
                curMatcher = matcher
                isInCharacterSet = true
                break
            case ']':
                curMatcher = curMatcher.parent
                isInCharacterSet = false
                spreadSet(curMatcher)
                break
            case '{':
                break
            case '}':
                break
            case '|':
                if (isInCharacterSet) {
                    curMatcher.value += c
                } else {
                    matcher = curMatcher
                    let parent = matcher.parent
                    let children = parent.children
                    curMatcher = new Matcher({
                        type: TYPE_OR,
                        parent: parent
                    })
                    children.push(curMatcher)
                    children.splice(children.indexOf(matcher), 1)
                    curMatcher.children.push(matcher)
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
                if (isInCharacterSet) {
                    curMatcher.value += c
                } else {
                    matcher = curMatcher
                    curMatcher = new Matcher({
                        type: TYPE_DOT,
                        parent: matcher.parent
                    })
                    matcher.parent.children.push(curMatcher)
                }

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
