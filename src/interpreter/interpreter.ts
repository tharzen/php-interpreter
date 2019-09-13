/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry of interpreter.
 * @see
 * https://github.com/php/php-langspec/tree/master/spec
 */

import log = require("ololog");     // print prettier
import { AST } from "php-parser";
import { Evaluator } from "./evaluator/evaluator";
import * as Parser from "./php-parser/src/index.js";

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ INTERPRETER ███████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @property {AST}        ast - abstract syntax tree
 * @property {Evaluator}  evl - evaluator which follow language rules to convert parse tree to a value
 *                              and read and modify the environment as needed
 * @property {Map}        ini - options from `php.ini` file, each setting corresponds to a key in map
 * @property {string}     res - final interpreted result
 * @property {string}     src - PHP source code
 */
export class Interpreter {
    public ast: AST;
    public evl: Evaluator;
    public ini: Map<string, boolean>;      // setting (string) => boolean
    public res: string;
    public src: string;

    /**
     * @description
     * The main entry for running the interpreter
     */
    public run: () => void;

    /**
     * @description
     * The helper API for display the components of interpreter
     */
    public display: (arg: string) => void;

    constructor(src: string, ini?: any) {
        this.src = src;
        this.ini = ini;
    }
}

Interpreter.prototype.run = function() {
    // initialize parser
    const parser = new Parser({
        ast: {
            withPositions: true,
        },
        parser: {
            locations: true,
        },
    });
    // TODO: preset some options such as from `php.ini`: this.ini and then evaluate AST
    this.ast = parser.parseCode(this.src, "");
    this.evl = new Evaluator(parser, this.ast);
    this.res = this.evl.run();
};

Interpreter.prototype.display = function(comp: string) {
    switch (comp) {
        case "ast":
            console.log("███████████████ Abstract Syntax Tree ███████████████");
            log.noFancy(this.evl.ast);
            break;
        case "environment":
            console.log("███████████████ PHP Environment ███████████████");
            log.noFancy(this.evl.env);
            break;
        case "heap":
            console.log("███████████████ PHP Heap ███████████████");
            log.noFancy(this.evl.heap);
            break;
        case "stack":
            console.log("███████████████ Execution Stack ███████████████");
            log.noFancy(this.evl.stk);
            break;
        case "result":
            console.log("███████████████ PHP Output ███████████████");
            log.noFancy(this.evl.res);
            break;
        case "log":
            console.log("███████████████ Execution Log ███████████████");
            log.noFancy(this.evl.log);
            break;
        default:
            console.log("███████████████ Sorry, cannot print this part in interpreter ███████████████");
            break;
    }
};
