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

    public run: () => void;
    public evaluate: (expr: Node) => void;
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

Evaluator.prototype.evaluateAssign = function() {
    // split the top element into seperate steps
    const topStkNode = this.stk.top; this.stk.pop();
    this.stk.push({ node: topStkNode.value.node.left });
    this.stk.push({ opts: topStkNode.value.node.operator });
    this.evaluate(topStkNode.value.node.right);     // evalute right expressions and then push the value back into stack

    // start assign
    const rightVal = this.stk.top.value; this.stk.pop();
    const operator = this.stk.top.value; this.stk.pop();
    const leftVal = this.stk.top.value; this.stk.pop();
    if (operator.opts === "=") {
        // search this variable in the current environment otherwise new one
        const currentEnv = this.env.env.peekLast();
        if (currentEnv[leftVal.node.name] !== undefined) {
            
        } else {
            
        }
    }
};

/**
 * @description
 * Node in the execution stack. It could be a AST node, an instruction, an operator and etc.
 */
interface IStkNode {
    node?: Node;        // AST node ?
    opts?: string;      // operator ?
    vals?: any;         // value ?
    inst?: string;      // instruction ?
}

export { Evaluator };
