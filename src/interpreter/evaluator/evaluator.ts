/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is the main entry of interpreter.
 */

import { Stack } from "../../utils/stack";
import { ENV } from "../environment";
import { AST } from "../php-parser/src/ast";
import { Node } from "../php-parser/src/ast/node";

/**
 * @param {object}  ast - abstract syntax tree
 * @param {ENV}     env - execution environment
 * @param {Node}    exp - current execute expressions (AST node)
 * @param {Stack}   stk - stack keeping a log of the functions which are called during the execution
 */
class Evaluator {
    public ast: AST;
    public env: ENV;
    public exp: Node;
    public stk: Stack<Node>;
    public eval: () => void;
    public evaluate: (expr: Node) => void;
    constructor(ast: AST) {
        this.ast = ast;
        this.env = new ENV();
        this.stk = new Stack<Node>();
    }
}

Evaluator.prototype.eval = function () {
    this.ast.children.forEach((child: Node) => {
        this.evaluate(child);
    });
};

Evaluator.prototype.evaluate = function(expr) {
    if (expr.kind === "expressionstatement") {
        switch (expr.expression.kind) {
            case "assign":
                console.log("yes");
                break;
            default:
                break;
        }
    }
};

export { Evaluator };
