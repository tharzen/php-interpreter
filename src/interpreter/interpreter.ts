/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is the main entry of interpreter.
 */

import { Evaluator } from "./evaluator/evaluator";
import { AST } from "./php-parser/src/ast";
import * as Parser from "./php-parser/src/index.js";

/**
 * @param {object}  ast - abstract syntax tree
 * @param {Evaluator} evl - evaluator which follow language rules to convert parse tree to a value
 *                          and read and modify the environment as needed
 * @param {Record}  ini - options from `php.ini` file
 * @param {String}  res - final interpreted result
 * @param {String}  src - PHP source code
 */
class Interpreter {
    public ast: AST;
    public evl: Evaluator;
    public ini: Record<string, boolean>;
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
    // preset some options such as from `php.ini`: this.ini and then evaluate AST
    this.ast = parser.parseCode(this.src);
    this.evl = new Evaluator(this.ast);
    if (this.ast.children.length > 0) {
        this.evl.eval();
    }
};

export { Interpreter };
