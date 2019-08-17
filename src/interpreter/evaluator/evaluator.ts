/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The main entry of evaluator.
 */

import { Node as ASTNode } from "../php-parser/src/ast/node";
import { AST } from "../php-parser/src/index";
import { Env } from "./environment";
import { ILocation } from "./memory";
import { Stack } from "./utils/stack";

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ EVALUATOR █████████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @param {AST}     ast - abstract syntax tree
 * @param {Map}     env - environments map
 * @param {number}  cur - current environment index
 * @param {Stack}   stk - stack keeping a log of the functions which are called during the execution
 * @param {IHeap}   heap - storage, such as variable bindings, function declaration, class declaration, namespace location and etc.
 */
export class Evaluator {
    public ast: AST;
    public env: Map<number, Env>;
    public cur: number;
    public stk: Stack<IStkNode>;
    public heap: IHeap;

    /**
     * @description
     * The main entry for running the evaluator
     */
    public run: () => void;

    /**
     * @description
     * The main entry for evaluation
     */
    public evaluate: () => void;

    /**
     * @description
     * The basic assignment operator is "=".
     * And there are "combined operators" for all of the binary arithmetic, array union and string operators
     * @file evaluator/evaluation/assign.ts
     */
    public evaluateAssign: () => void;

    /**
     * @description
     * Evaluate array
     * @file
     * evaluator/evaluation/array.ts
     */
    public evaluateArray: () => void;

    /**
     * @description
     * Evaluate the global variable
     * @file
     * evaluator/evaluation/global.ts
     */
    public evaluateGlobal: () => void;

    /**
     * @description
     * Evaluate the offset of the array or string or object
     * @file
     * evaluator/evaluation/offset.ts
     */
    public evaluateOffset: () => void;

    /**
     * @description
     * Evaluate the local variable
     * @file
     * evaluator/evaluation/variable.ts
     */
    public evaluateVariable: () => void;

    /**
     * @description
     * Evaluate the binary operator
     * @file
     * evaluator/evaluation/bin.ts
     */
    public evaluateBinary: () => void;

    constructor(ast: AST) {
        this.ast = ast;
        this.env = new Map();
        this.env.set(0, new Env());     // global environment
        this.cur = 0;
        this.stk = new Stack<IStkNode>();
        this.heap = {
            ptr: 0,
            ram: new Map(),
        };
    }
}

Evaluator.prototype.run = function() {
    // the root node of AST is "Program", its children field contains the expressions we'll evaluate
    this.ast.children.forEach((child: Node) => {
        const stknode: IStkNode = { node: child, val: undefined };
        this.stk.push(stknode);
        this.evaluate();
    });
};

Evaluator.prototype.evaluate = function() {
    // each time evaluate top element of stack
    const expr: ASTNode = this.stk.top.value.node; this.stk.pop();
    if (expr.kind === "expressionstatement") {
        switch (expr.expression.kind) {
            // `[1,2];` `"abc";` `1.6;` actually do nothing before the sequence point so don't need to evaluate
            // if it might be evaluated, it will be treated as a rval which we need its value,
            // such as `$a[];` will throw reading fatal error in offical Zend PHP interpreter
            case "array":
            case "number":
            case "string":
            case "boolean":
                break;
            case "assign": {
                const stknode: IStkNode = {
                    node: expr.expression,
                };
                this.stk.push(stknode);
                this.evaluateAssign();
                break;
            }
            case "variable": {
                // declare a new variable or do nothing if it exists
                const stknode: IStkNode = {
                    node: expr.expression,
                };
                this.stk.push(stknode);
                this.evaluateVariable();
                break;
            }
            default:
                break;
        }
    } else if (expr.kind === "boolean") {
        // directly evaluate
        const stknode: IStkNode = {
            val: Boolean(expr.value),
        };
        this.stk.push(stknode);
    } else if (expr.kind === "number") {
        // directly evaluate
        const stknode: IStkNode = {
            val: Number(expr.value),    // 0x539 == 02471 == 0b10100111001 == 1337e0
        };
        this.stk.push(stknode);
    } else if (expr.kind === "string") {
        // directly evaluate
        const stknode: IStkNode = {
            val: String(expr.value),
        };
        this.stk.push(stknode);
    } else if (expr.kind === "assign") {
        const stknode: IStkNode = {
            node: expr,
        };
        this.stk.push(stknode);
        this.evaluateAssign();
    } else if (expr.kind === "variable") {
        const stknode: IStkNode = {
            node: expr,
        };
        this.stk.push(stknode);
        this.evaluateVariable();
    } else if (expr.kind === "array") {
        const stknode: IStkNode = {
            node: expr,
        };
        this.stk.push(stknode);
        this.evaluateArray();
    } else if (expr.kind === "global") {
        const stknode: IStkNode = {
            node: expr,
        };
        this.stk.push(stknode);
        this.evaluateGlobal();
    } else {
        throw new Error("Eval Error: Unknown expression type: " + expr.kind);
    }
};

/**
 * @description
 * Node in the execution stack. It could be a AST node, an instruction, an operator and a value
 * @param {any} val - Any AST nodes which can be evaluated to a value should store its value here, e.g. 1, true, "abc", { ... }
 * @param {ILocation} loc - Any AST nodes which can be found in memory should store its location here
 * @param {string} inst - instructions, e.g. READ, WRITE, END
 * @param {ASTNode} node - AST node
 */
export interface IStkNode {
    val?: any;
    loc?: ILocation;
    inst?: string;
    node?: ASTNode;
}

/**
 * @description
 * Storage which used to store any value or information in evaluator
 * @param {Map}    ram - address => any acceptable data type or abstract model
 * @param {number} ptr - address pointer, automatically increase
 */
export interface IHeap {
    ram: Map<number, any>;
    ptr: number;
}
