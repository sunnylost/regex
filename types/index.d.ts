import Type from '../src/key'
import Matcher from '../src/matcher'

export declare interface Quantifier {
    min: number
    max: number
}

export declare interface MatchResult extends Array<string> {
    input?: string
    index?: number
}

export declare interface Matcher {
    type: Type
    value: string
    isRoot: boolean
    children: Matcher[] | Matcher[][] | any[]
    parent: Matcher | null
    isFirst: boolean
    isLast: boolean
    isNegative: boolean
    isGreedy: boolean
    isClosed: boolean
    groupIndex: number
    index: number
    lastCheckIndex: number
    leastMatchResult: {}
    localTrackStack: []
    quantifier: Quantifier
    matchResult: object
    preMatchResult: any[]
    preMatchedIndex: number
    execute(config: object, index: number): any
    match(config: object, index: number): any
}
