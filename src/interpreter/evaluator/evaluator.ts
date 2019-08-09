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
    public evaluate: () => void;

    /**
     * @description
     * The basic assignment operator is "="
     * There are "combined operators" for all of the binary arithmetic, array union and string operators
     * @file
     * evaluator/evaluation/assign.ts
     */
    public evaluateAssign: () => void;

    /**
     * @description
     * Convert array on PHP to map object in the variable system.
     * @file
     * evaluator/evaluation/array.ts
     */
    public evaluateArray: () => void;

    constructor(ast: AST) {
        this.ast = ast;
        this.env = new Env();
        this.stk = new Stack<IStkNode>();
    }
}

Evaluator.prototype.run = function() {
    // the root node of AST is "Program", its children field contains the expressions we'll evaluate
    this.ast.children.forEach((child: Node) => {
        const stknode: IStkNode = {
            node: child,
        };
        this.stk.push(stknode);
        this.evaluate();
    });
};

Evaluator.prototype.evaluate = function() {
    // each time evaluate top element of stack
    const expr: Node = this.stk.top.value.node; this.stk.pop();
    if (expr.kind === "expressionstatement") {
        switch (expr.expression.kind) {
            case "assign": {
                const stknode: IStkNode = {
                    node: expr.expression,
                };
                this.stk.push(stknode);
                this.evaluateAssign();
                break;
            }
            default:
                break;
        }
    } else if (expr.kind === "boolean") {
        const stknode: IStkNode = {
            vals: Boolean(expr.value),
        };
        this.stk.push(stknode);
    } else if (expr.kind === "number") {
        const stknode: IStkNode = {
            vals: Number(expr.value),
        };
        this.stk.push(stknode);
    } else if (expr.kind === "string") {
        const stknode: IStkNode = {
            vals: String(expr.value),
        };
        this.stk.push(stknode);
    } else if (expr.kind === "assign") {
        const stknode: IStkNode = {
            node: expr,
        };
        this.stk.push(stknode);
        this.evaluateAssign();
    } else {
        throw new Error("Unknown expression type: " + expr.kind);
    }
};

/**
 * @description
 * Node in the execution stack. It could be a AST node, an instruction, an operator and etc.
 */
export interface IStkNode {
    inst?: string;      // instruction ?
    node?: Node;        // AST node ?
    opts?: any;      // operator ?
    vals?: any;         // value ?
}

export { Evaluator };
