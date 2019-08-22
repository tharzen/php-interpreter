var util = require("util");

let a = {
    kind: "program",
    loc: {
        source: null,
        start: {
            line: 1,
            "column": 0,
            offset: 0
        },
        "end": {
            line: 2,
            "column": 12,
            offset: 18
        }
    },
    "children": [
        {
            kind: "expressionstatement",
            loc: {
                source: null,
                start: {
                    line: 2,
                    "column": 0,
                    offset: 6
                },
                "end": {
                    line: 2,
                    "column": 12,
                    offset: 18
                }
            },
            "expression": {
                kind: "assign",
                loc: {
                    source: null,
                    start: {
                        line: 2,
                        "column": 0,
                        offset: 6
                    },
                    "end": {
                        line: 2,
                        "column": 12,
                        offset: 18
                    }
                },
                operator: "=",
                "left": {
                    kind: "variable",
                    loc: {
                        source: null,
                        start: {
                            line: 2,
                            "column": 0,
                            offset: 6
                        },
                        "end": {
                            line: 2,
                            "column": 2,
                            offset: 8
                        }
                    },
                    name: "a",
                    "byref": false,
                    curly: false
                },
                right: {
                    kind: "bin",
                    loc: {
                        source: null,
                        start: {
                            line: 2,
                            "column": 5,
                            offset: 11
                        },
                        "end": {
                            line: 2,
                            "column": 11,
                            offset: 17
                        }
                    },
                    type: "+",
                    "left": {
                        kind: "variable",
                        loc: {
                            source: null,
                            start: {
                                line: 2,
                                "column": 5,
                                offset: 11
                            },
                            "end": {
                                line: 2,
                                "column": 7,
                                offset: 13
                            }
                        },
                        name: "b",
                        "byref": false,
                        curly: false
                    },
                    right: {
                        kind: "number",
                        loc: {
                            source: null,
                            start: {
                                line: 2,
                                "column": 10,
                                offset: 16
                            },
                            "end": {
                                line: 2,
                                "column": 11,
                                offset: 17
                            }
                        },
                        value: "1"
                    }
                }
            }
        }
    ],
    errors: [],
    comments: []
};

let b = {
    xx: {},
}
Object.assign(b.xx, a);

console.log(util.inspect(b, { depth: null }));