//type
import Type from './key'
import Matcher from './matcher'
import { IMatcher } from '../types'

const SPECIAL_TRANSFER = 'dDsSwWtrnvf0'

function isDigit(c): boolean {
    return c >= '0' && c <= '9'
}

function spreadSet(matcher: IMatcher): void {
    // debugger
    if (matcher.type !== Type.SET) {
        return
    }

    const isIgnoreCase = this.ignoreCase
    let children = matcher.children
    const newChildren = []

    if (children[0].value === '^') {
        matcher.isNegative = true
        children = children.slice(1)
    }

    for (let i = 0; i < children.length; i++) {
        const c = children[i]
        let value = c.value

        if (c.type === Type.SPECIAL_CHAR) {
            newChildren.push({
                type: c.type,
                value
            })
        } else {
            if (isIgnoreCase) {
                value = value.toLowerCase()
            }
            // debugger
            if (value !== '-' || i === 0) {
                newChildren.push(v => {
                    if (isIgnoreCase && v) {
                        v = v.toLowerCase()
                    }

                    return v === value
                })
            } else {
                newChildren.pop()
                let prevValue = children[i - 1].value
                const nextChildren = children[i + 1]
                let nextValue = nextChildren && nextChildren.value

                if (isIgnoreCase) {
                    prevValue = prevValue.toLowerCase()
                    nextValue && (nextValue = nextValue.toLowerCase())
                }

                const a = prevValue.charCodeAt(0)
                const b = nextChildren ? nextValue.charCodeAt(0) : Infinity

                if (a > b) {
                    throw new SyntaxError(
                        `Invalid regular expression: /${matcher.value}/: Range out of order in character class`
                    )
                }

                newChildren.push(v => {
                    if (isIgnoreCase) {
                        v = v.toLowerCase()
                    }

                    return v.charCodeAt(0) >= a && v.charCodeAt(0) <= b
                })
                i += 1
            }
        }
    }

    matcher.children = newChildren
}

function isContainerMatcher(matcher): boolean {
    return (
        matcher.isRoot ||
        ((matcher.type === Type.GROUP || matcher.type === Type.LOOK_AROUND) &&
            !matcher.isClosed) ||
        matcher.type === Type.OR ||
        (matcher.type === Type.SET && !matcher.isClosed)
    )
}

function appendChildren(parentMatcher, childMatcher): void {
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
function isQuantifierValid(matcher, quantifier?): boolean {
    if (matcher.isRoot) {
        throw new Error('Nothing to repeat')
    }

    if (matcher.quantifier) {
        if (quantifier === '?' && matcher.isGreedy) {
            return true
        } else {
            throw new Error('Nothing to repeat')
        }
    }
}

/**
 * construct a matcher tree
 * @param ctx
 * @returns {Array}
 */
export default ctx => {
    const pattern = ctx.pattern
    const len = pattern.length
    let isInCharacterSet = false
    let captureIndex = 1
    const groups = {}
    const stack: IMatcher[] = [new Matcher({ isRoot: true })]
    let curMatcher: IMatcher = stack[0]
    let matcher: IMatcher
    let i
    let c
    let parent
    let children

    function consumeQuantifiers(): void {
        let min: number | string = ''
        let max: number | string = ''
        let tmp = ''
        let hasDot = false

        while (i < len) {
            const c = pattern[i]

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

    function consumeTransfer(): void {
        const c = pattern[i]
        let matcher

        if (SPECIAL_TRANSFER.includes(c) || (isInCharacterSet && c === 'b')) {
            //TODO
            appendChildren(
                curMatcher,
                (matcher = new Matcher({
                    type: Type.SPECIAL_CHAR,
                    value: c
                }))
            )
        } else if (c === 'b' || c === 'B') {
            appendChildren(
                curMatcher,
                (matcher = new Matcher({
                    type: Type.ASSERT,
                    value: c
                }))
            )
            /**
             * handle reference like \1, \2
             * groupIndex is a non-zero digit
             */
        } else if (isDigit(c) && c !== '0') {
            let num = ''

            while (1) {
                if (isDigit(pattern[i])) {
                    num += pattern[i]
                    i++
                } else {
                    i--
                    break
                }
            }

            appendChildren(
                curMatcher,
                (matcher = new Matcher({
                    type: Type.REFERENCE,
                    value: num
                }))
            )
        } else {
            appendChildren(
                curMatcher,
                (matcher = new Matcher({
                    type: Type.CHAR,
                    value: c
                }))
            )
        }

        if (curMatcher.type !== Type.SET) {
            curMatcher = matcher
        }
    }

    function expect(str): boolean {
        for (let j = 0; j < str.length; j++) {
            if (pattern[i + j + 1] !== str[j]) {
                return false
            }
        }

        return true
    }

    for (i = 0; i < len; i++) {
        c = pattern[i]
        // debugger

        //TODO: not handle "\\]"
        if (isInCharacterSet && c !== '\\' && c !== ']') {
            appendChildren(
                curMatcher,
                new Matcher({
                    type: Type.CHAR,
                    value: c
                })
            )
            continue
        }
        // debugger
        switch (c) {
            case '(':
                matcher = curMatcher

                if (expect('?=')) {
                    i += 2
                    curMatcher = new Matcher({
                        type: Type.LOOK_AROUND,
                        value: '?='
                    })
                } else if (expect('?!')) {
                    i += 2
                    curMatcher = new Matcher({
                        type: Type.LOOK_AROUND,
                        value: '?!'
                    })
                } else if (expect('?<=')) {
                    i += 3
                    curMatcher = new Matcher({
                        type: Type.LOOK_AROUND,
                        value: '?<='
                    })
                } else if (expect('?<!')) {
                    i += 3
                    curMatcher = new Matcher({
                        type: Type.LOOK_AROUND,
                        value: '?<!'
                    })
                } else if (expect('?:')) {
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
                // match empty
                if (
                    !curMatcher.children.length &&
                    curMatcher.type === Type.GROUP
                ) {
                    curMatcher.children.push(
                        new Matcher({
                            type: Type.EMPTY
                        })
                    )
                }

                while (1) {
                    if (curMatcher.isRoot) {
                        break
                    }

                    curMatcher = curMatcher.parent

                    if (
                        curMatcher.type === Type.GROUP ||
                        curMatcher.type === Type.LOOK_AROUND
                    ) {
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
                curMatcher.isClosed = true
                isInCharacterSet = false
                spreadSet.call(ctx, curMatcher)
                break
            case '{':
                isQuantifierValid(curMatcher, c)
                i++
                consumeQuantifiers()
                break
            case '|':
                matcher = curMatcher

                if (matcher.isRoot) {
                    parent = matcher
                    children = parent.children

                    if (!children.length) {
                        children.push(
                            new Matcher({
                                type: Type.EMPTY
                            })
                        )
                    }
                } else {
                    //TODO: need to check children?
                    parent = matcher.parent
                    children = parent.children
                }

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
            case '$':
                matcher = curMatcher
                curMatcher = new Matcher({
                    type: Type.ASSERT,
                    value: c
                })

                appendChildren(matcher, curMatcher)
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

                if (curMatcher.quantifier) {
                    curMatcher.isGreedy = false
                } else {
                    curMatcher.quantifier = {
                        min: 0,
                        max: 1
                    }
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
}
