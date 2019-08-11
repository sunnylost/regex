enum Type {
    ASSERT = 'assert',
    GROUP = 'group', //(xxx)
    SET = 'set', //[xxx]
    DOT = 'dot', //.
    OR = 'or', //a|b
    CHAR = 'char', //xxx
    SPECIAL_CHAR = 'special-char', //\d, \D, \b...
    ALWAYS_PASS = 'always-pass', //TODO
    EMPTY = 'empty'
}
export default Type
