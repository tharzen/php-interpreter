/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry of interpreter.
 * @see
 * https://github.com/php/php-langspec/tree/master/spec
 */

import { Evaluator } from "./evaluator/evaluator";
import { AST } from "./php-parser/src/ast";
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
    public run: () => void;

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
    this.ast = parser.parseCode(this.src);
    this.evl = new Evaluator(parser, this.ast);
    this.res = this.evl.run();
};
