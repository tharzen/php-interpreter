/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is the main entry of interpreter.
 */

import { Node } from "../php-parser/src/ast/node";
import { AST } from "../php-parser/src/index";
import { Env } from "./environment";
import { Stack } from "./utils/stack";

/**
 * @param {AST}     ast - abstract syntax tree
 * @param {Env}     env - execution environment
 * @param {Node}    exp - current execute expressions (AST node)
 * @param {Stack}   stk - stack keeping a log of the functions which are called during the execution
 */
class Evaluator {
    public ast: AST;
    public env: Env;
    public exp: Node;
    public stk: Stack<IStkNode>;

    /**
     * @description
     * The main entry for running the evaluator.
     */
    public run: () => void;

    /**
     * @description
     * The main entry for evaluation.
     */
    public evaluate: (expr: Node) => void;

    /**
     * @description
     * The basic assignment operator is "=".
     * There are "combined operators" for all of the binary arithmetic, array union and string operators
     * that allow you to use a value in an expression and then set its value to the result of that expression
     * @example
     * $a = 1;
     * $a += 1;
     * $a = $b;
     * $a = &$b;
     * $a = ($b = 5);
     * @file
     * evaluator/evaluation/assign.ts
     */
    public evaluateAssign: () => void;

    constructor(ast: AST) {
        this.ast = ast;
        this.env = new Env();
        this.stk = new Stack<IStkNode>();
    }
}

Evaluator.prototype.run = function() {
    // the root node of AST is "Program", its children field contains the expressions we'll evaluate
    this.ast.children.forEach((child: Node) => {
        this.evaluate(child);
    });
};

Evaluator.prototype.evaluate = function(expr) {
    if (expr.kind === "expressionstatement") {
        switch (expr.expression.kind) {
            case "assign": {
                const stknode: IStkNode = {
                    node: expr,
                };
                this.stk.push(stknode);
                this.evaluateAssign();
                break;
            }
            default:
                break;
        }
    }
};

/**
 * @description
 * Node in the execution stack. It could be a AST node, an instruction, an operator and etc.
 */
interface IStkNode {
    inst?: string;      // instruction ?
    node?: Node;        // AST node ?
    opts?: string;      // operator ?
    vals?: any;         // value ?
}

export { Evaluator };
