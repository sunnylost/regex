//type
import {
    TYPE_GROUP,
    TYPE_SET,
    TYPE_DOT,
    TYPE_OR,
    TYPE_CHAR,
    TYPE_SPECIAL_CHAR
} from './key'
import Matcher from './matcher'

const META_CHARACTERS = '()[]{}|^$.*?+-,'
const SET_META_CHARACTERS = '[](){}|$.*?+,'
const SPECIAL_TRANSFER = 'bBdDsSwWtrnvf0'

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
            let a = chars[i - 1].charCodeAt(0)
            let b = chars[i + 1] ? chars[i + 1].charCodeAt(0) : Infinity

            if (a > b) {
                throw new SyntaxError(
                    `Invalid regular expression: /${chars}/: Range out of order in character class`
                )
            }

            newChildren.push(v => v.charCodeAt(0) >= a && v.charCodeAt(0) <= b)
            i += 1
        }
    }

    matcher.children = newChildren
}

function isContainerMatcher(matcher) {
    return (
        matcher.isRoot ||
        (matcher.type === TYPE_GROUP && !matcher.isClosed) ||
        matcher.type === TYPE_OR
    )
}

//TODO
function isQuantifierValid(matcher, quantifier) {
    if (matcher.isRoot || matcher.quantifier) {
        throw new Error('Nothing to repeat')
    }
}

/**
 * construct a matcher tree
 * @param pattern
 * @returns {Array}
 */
export default pattern => {
    let len = pattern.length
    let isInCharacterSet = false
    let captureIndex = 1
    let groups = {}
    let stack = [
        {
            isRoot: true,
            children: []
        }
    ]
    let curMatcher = stack[0]
    let matcher
    let i
    let c
    let parent
    let children

    for (i = 0; i < len; i++) {
        c = pattern[i]
        // debugger

        if (isInCharacterSet && c !== ']' && SET_META_CHARACTERS.includes(c)) {
            curMatcher.value += c
            continue
        }
        // debugger
        switch (c) {
            case '(':
                if (isContainerMatcher(curMatcher)) {
                    children = curMatcher.children
                    parent = curMatcher
                } else {
                    children = curMatcher.parent.children
                    parent = curMatcher.parent
                }

                curMatcher = new Matcher({
                    type: TYPE_GROUP,
                    parent,
                    groupIndex: captureIndex++
                })

                children.push(curMatcher)
                groups[curMatcher.groupIndex] = curMatcher
                break
            case ')':
                // debugger
                while (1) {
                    if (curMatcher.isRoot) {
                        break
                    }

                    curMatcher = curMatcher.parent

                    if (curMatcher.type === TYPE_GROUP) {
                        curMatcher.isClosed = true
                        break
                    }
                }

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
                isQuantifierValid(curMatcher, c)
                i++
                consumeQuantifiers()
                break
            case '|':
                matcher = curMatcher
                parent = matcher.parent
                children = parent.children
                curMatcher = new Matcher({
                    type: TYPE_OR,
                    parent: parent
                })
                children.push(curMatcher)
                children.splice(children.indexOf(matcher), 1)
                curMatcher.children.push(matcher)

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
                isQuantifierValid(curMatcher, c)
                curMatcher.quantifier = {
                    min: 1,
                    max: Infinity
                }
                break
            case '*':
                isQuantifierValid(curMatcher, c)
                curMatcher.quantifier = {
                    min: 0,
                    max: Infinity
                }
                break
            case '?':
                isQuantifierValid(curMatcher, c)
                curMatcher.quantifier = {
                    min: 0,
                    max: 1
                }
                break
            case '\\': //TODO: \\\\
                i++
                consumeTransfer()
                break
            case '.':
                matcher = curMatcher
                curMatcher = new Matcher({
                    type: TYPE_DOT,
                    parent: matcher.parent
                })
                matcher.parent.children.push(curMatcher)

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

                    if (isContainerMatcher(matcher)) {
                        matcher.children.push(curMatcher)
                    } else {
                        matcher.parent.children.push(curMatcher)
                    }
                }
        }
    }

    return {
        states: stack[0].children,
        groups
    }

    function consumeQuantifiers() {
        let min = ''
        let max = ''
        let tmp = ''
        let hasDot = false

        while (i < len) {
            let c = pattern[i]

            if (c === '}') {
                max = tmp.trim()

                if (!min.length) {
                    min = 0
                } else {
                    min = parseInt(min, 10)
                }

                if (!max.length) {
                    max = Infinity
                } else {
                    max = parseInt(max, 10)
                }

                if (!hasDot) {
                    min = max
                }

                if (min !== min || max !== max) {
                    return //not valid
                }

                if (max < min) {
                    throw new SyntaxError(
                        `Invalid regular expression: /${pattern}/: numbers out of order in {} quantifier`
                    )
                }

                curMatcher.quantifier = {
                    min,
                    max
                }
                return
            }

            tmp += c

            if (c === ',') {
                hasDot = true
                min = tmp.trim()
                tmp = ''
            }

            i++
        }
    }

    function consumeTransfer() {
        let c = pattern[i]

        if (SPECIAL_TRANSFER.includes(c)) {
            //TODO
            let parent

            if (isContainerMatcher(curMatcher)) {
                parent = curMatcher
            } else {
                parent = curMatcher.parent
            }

            parent.children.push(
                (curMatcher = new Matcher({
                    type: TYPE_SPECIAL_CHAR,
                    parent,
                    value: c
                }))
            )
        } else {
            //TODO
        }
    }
}
