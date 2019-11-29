import Type from '../src/key'

export declare interface IQuantifier {
    min: number
    max: number
}

export declare interface IMatchResult extends Array<string> {
    input?: string
    index?: number
    groups?: undefined | Array<string>
}

export declare interface IRe {
    pattern: string | RegExp
    flags: string
    lastIndex: number
    traceStack: IMatcher[]
    states: IMatcher[]
    source: string
    groups: {}
    isTraceback: boolean
    dotAll: boolean
    global: boolean
    ignoreCase: boolean
    multiline: boolean
    sticky: boolean
    parseFlags()
    parseStates()
    match(str: string): object
    test(str: string): boolean
}

export declare interface IMatcher {
    type: Type
    value: string
    isRoot: boolean
    children: IMatcher[] | IMatcher[][] | any[]
    parent: IMatcher | null
    isNegative: boolean
    isGreedy: boolean
    isClosed: boolean
    groupIndex: number
    index: number
    lastCheckIndex: number
    leastMatchResult: {}
    localTrackStack: []
    quantifier: IQuantifier
    matchResult: any
    preMatchResult: any[]
    preMatchedIndex: number
    execute(config: IRe, index: number): any
    match(config: IRe, index: number): any
    handleQuantifier(config: IRe, index: number): any
    handleTraceback(config: IRe, index: number): any
    toString(): string
}
