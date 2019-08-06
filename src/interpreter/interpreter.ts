/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is the main entry of interpreter.
 */

import { Evaluator } from "./evaluator/evaluator";
import { AST } from "./php-parser/src/ast";

/**
 * @param {object}  ast - abstract syntax tree
 * @param {Evaluator} evl - evaluator which follow language rules to convert parse tree to a value
 *                          and read and modify the environment as needed
 * @param {Record}  ini - options from `php.ini` file
 * @param {String}  res - final interpreted result
 */
class Interpreter {
    public ast: AST;
    public evl: Evaluator;
    public ini: Record<string, boolean>;
    public res: string;
    public run: () => void;
    constructor(ast: AST, ini?: any) {
        this.ast = ast;
        this.evl = new Evaluator(this.ast);
        this.ini = ini;
    }
}

Interpreter.prototype.run = function() {
    // preset some options such as from `php.ini`: this.ini and then evaluate AST
    if (this.ast.children.length > 0) {
        this.evl.eval();
    }
};

export { Interpreter };
