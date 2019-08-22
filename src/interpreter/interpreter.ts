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
 * @param {object}     ast - abstract syntax tree
 * @param {Evaluator}  evl - evaluator which follow language rules to convert parse tree to a value
 *                           and read and modify the environment as needed
 * @param {Record}     ini - options from `php.ini` file, each setting corresponds to a key in map
 * @param {String}     res - final interpreted result
 * @param {String}     src - PHP source code
 */
class Interpreter {
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
    const parser = new Parser({ast: { withPositions: true }, parser: { locations: true }});
    // preset some options such as from `php.ini`: this.ini and then evaluate AST
    this.ast = parser.parseCode(this.src);
    this.evl = new Evaluator(this.ast);
    if (this.ast.children.length > 0) {
        this.evl.run();
    }
};

export { Interpreter };
