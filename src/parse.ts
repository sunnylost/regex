//type
import Type from './key'
import Matcher from './matcher'

const SPECIAL_TRANSFER = 'bBdDsSwWtrnvf0'

function spreadSet(matcher) {
    if (matcher.type !== Type.SET) {
        return
    }

    let chars = matcher.value
    let newChildren = []

    for (let i = 0; i < chars.length; i++) {
        let c = chars[i]
        // debugger
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
        (matcher.type === Type.GROUP && !matcher.isClosed) ||
        matcher.type === Type.OR
    )
}

function appendChildren(parentMatcher, childMatcher) {
    let parent
    let children

    if (isContainerMatcher(parentMatcher)) {
        children = parentMatcher.children
        parent = parentMatcher
    } else {
        parent = parentMatcher.parent
        children = parentMatcher.parent.children
    }

    childMatcher.parent = parent

    if (parent.type === Type.OR) {
        parent.children[1].push(childMatcher)
    } else {
        children.push(childMatcher)
    }
}

//TODO
function isQuantifierValid(matcher, quantifier?) {
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
    let stack: Matcher[] = [new Matcher({ isRoot: true })]
    let curMatcher: Matcher = stack[0]
    let matcher: Matcher
    let i
    let c
    let parent
    let children

    for (i = 0; i < len; i++) {
        c = pattern[i]
        // debugger

        //TODO: not handle "\\]"
        if (isInCharacterSet && c !== ']') {
            curMatcher.value += c
            continue
        }
        // debugger
        switch (c) {
            case '(':
                matcher = curMatcher

                if (expect('?:')) {
                    i += 2
                    curMatcher = new Matcher({
                        type: Type.GROUP
                    })
                } else {
                    curMatcher = new Matcher({
                        type: Type.GROUP,
                        groupIndex: captureIndex++
                    })

                    groups[curMatcher.groupIndex] = curMatcher
                }

                appendChildren(matcher, curMatcher)
                break
            case ')':
                while (1) {
                    if (curMatcher.isRoot) {
                        break
                    }

                    curMatcher = curMatcher.parent

                    if (curMatcher.type === Type.GROUP) {
                        curMatcher.isClosed = true
                        break
                    }
                }

                break
            case '[':
                matcher = curMatcher
                curMatcher = new Matcher({ type: Type.SET, parent: matcher })
                appendChildren(matcher, curMatcher)
                isInCharacterSet = true
                break
            case ']':
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
                    type: Type.OR
                })

                // a||c
                if (matcher.type === Type.OR) {
                    curMatcher.parent = matcher
                    children[1] = [curMatcher]
                    curMatcher.children = [
                        [
                            new Matcher({
                                type: Type.ALWAYS_PASS
                            })
                        ],
                        []
                    ]
                    // a|b|c
                } else if (parent.type === Type.OR) {
                    curMatcher.parent = parent
                    curMatcher.children = [[...children[1]], []]
                    parent.children[1] = [curMatcher]
                } else {
                    // left and right container
                    curMatcher.parent = parent
                    curMatcher.children = [[...children], []]
                    children.length = 0
                    children.push(curMatcher)
                }

                break

            case '^':
                if (isInCharacterSet) {
                    if (curMatcher.value) {
                        curMatcher.value += c
                    } else {
                        curMatcher.isNegative = true
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
                    type: Type.DOT
                })

                appendChildren(matcher, curMatcher)

                break
            default:
                matcher = curMatcher
                curMatcher = new Matcher({
                    type: Type.CHAR,
                    value: c
                })

                appendChildren(matcher, curMatcher)
        }
    }

    return {
        states: stack[0].children,
        groups
    }

    function consumeQuantifiers() {
        let min: number | string = ''
        let max: number | string = ''
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
            let matcher = curMatcher

            curMatcher = new Matcher({
                type: Type.SPECIAL_CHAR,
                value: c
            })

            appendChildren(matcher, curMatcher)
        } else {
            //TODO
        }
    }

    function expect(str) {
        for (let j = 0; j < str.length; j++) {
            if (pattern[i + j + 1] !== str[j]) {
                return false
            }
        }

        return true
    }
}