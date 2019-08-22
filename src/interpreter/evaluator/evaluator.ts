/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry of evaluator.
 */

import { Node as ASTNode } from "../php-parser/src/ast/node";
import { AST } from "../php-parser/src/index";
import { Env } from "./environment";
import { Stack } from "./utils/stack";

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ EVALUATOR █████████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @param {AST}     ast - abstract syntax tree
 * @param {Map}     env - two environments which technically are scopes, global and local
 * @param {number}  cur - current environment index, 0 for global, 1 for local
 * @param {Stack}   stk - stack keeping a log of the functions which are called during the execution
 * @param {IHeap}   heap - storage, such as variable bindings, function declaration, class declaration, namespace location and etc.
 */
export class Evaluator {
    public ast: AST;
    public env: Env[];
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
        this.env = Env[2];
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
    for (let i = this.ast.children.length - 1; i >= 0; i--) {
        const stknode: IStkNode = {
            data: this.ast.children[i],
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
    }
    while (this.stk.length() > 0) {
        this.evaluate();
    }
};

Evaluator.prototype.evaluate = function() {
    // each time evaluate top element of stack
    const topNode = this.stk.top.value; this.stk.pop();
    if (topNode.kind !== StkNodeKind.ast) {
        throw new Error("Eval Error: Evaluate wrong node: " + topNode.kind + ", should be a AST node");
    }

    const expr: ASTNode = topNode.data;
    if (expr.kind === "expressionstatement") {
        switch (expr.expression.kind) {
            // A statement with only a scalar type data such as: `[1,2];` `"abc";` `1.6;` actually do nothing before the sequence point
            // so we don't need to evaluate it
            // if it might be evaluated, it will be treated as a rval which we need its value,
            // such as `$a[];` will throw reading fatal error in offical Zend PHP interpreter
            case "array":
            case "number":
            case "string":
            case "boolean":
                break;
            case "assign": {
                const instNode: IStkNode = {
                    data: null,
                    inst: "endOfAssign",
                    kind: StkNodeKind.indicator,
                };
                this.stk.push(instNode);    // insurance
                const stknode: IStkNode = {
                    data: expr.expression,
                    inst: null,
                    kind: StkNodeKind.ast,
                };
                this.stk.push(stknode);
                this.evaluateAssign();
                break;
            }
            case "variable": {
                const instNode: IStkNode = {
                    data: null,
                    inst: "endOfVariable",
                    kind: StkNodeKind.indicator,
                };
                this.stk.push(instNode);    // insurance
                // declare a new variable or do nothing if it already exists
                const stknode: IStkNode = {
                    data: expr.expression,
                    inst: null,
                    kind: StkNodeKind.ast,
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
            data: Boolean(expr.value),
            inst: null,
            kind: StkNodeKind.value,
        };
        this.stk.push(stknode);
    } else if (expr.kind === "number") {
        // directly evaluate
        const stknode: IStkNode = {
            data: Number(expr.value),    // 0x539 == 02471 == 0b10100111001 == 1337e0
            inst: null,
            kind: StkNodeKind.value,
        };
        this.stk.push(stknode);
    } else if (expr.kind === "string") {
        // directly evaluate
        const stknode: IStkNode = {
            data: String(expr.value),
            inst: null,
            kind: StkNodeKind.value,
        };
        this.stk.push(stknode);
    } else if (expr.kind === "assign") {
        const stknode: IStkNode = {
            data: expr,
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateAssign();
    } else if (expr.kind === "variable") {
        const stknode: IStkNode = {
            data: expr,
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateVariable();
    } else if (expr.kind === "array") {
        const stknode: IStkNode = {
            data: expr,
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateArray();
    } else if (expr.kind === "global") {
        const stknode: IStkNode = {
            data: expr,
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateGlobal();
    } else {
        throw new Error("Eval Error: Unknown expression type: " + expr.kind);
    }
};

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

/**
 * @description
 * Stack node kinds, 0 for ast, 1 for value, 2 for address
 */
export enum StkNodeKind {
    ast,
    value,
    address,
    indicator,
}
/**
 * @description
 * Node in the execution stack. It could be a AST node, an instruction, an operator and a value
 * @param {StkNodeKind}  kind - Stack node kind, e.g. "ast" => AST node, "address" => address refers to any value in Heap,
 *                              "value" => any PHP data, "instuct"
 * @param {any}          data - any data correspond to its kind
 * @param {string}       inst - any instruction guiding the evaluation actions
 * @example
 * { kind: "ast", data: "{...}", inst: "getAddress" }
 * { kind: "value", data: false, inst: null }
 * { kind: "address", data: 15073, inst: null }
 * { kind: "indicator", data: null, inst: "endOfAssign" }
 * { kind: "indicator", data: null, inst: "+" }
 */
export interface IStkNode {
    kind: StkNodeKind;
    data: any;
    inst: string;
}

/**
 * @description
 * Evaluation stack pop API, provides stack node type check
 * @param {Stack}       stk
 * @param {StkNodeKind} kindMustBe
 * @param {string}      astKindMustBe
 */
export function evalStkPop(stk: Stack<IStkNode>, kindMustBe: StkNodeKind, astKindMustBe?: string, indicatorMustBe?: string): IStkNode {
    const node = stk.top.value;
    switch (kindMustBe) {
        case StkNodeKind.ast: {
            if (node.kind !== StkNodeKind.ast) {
                throw new Error("Eval Error: Evaluate wrong node: " + node.kind + ", should contain AST node");
            } else if (astKindMustBe) {
                if (node.data.kind !== astKindMustBe) {
                    throw new Error("Eval Error: Evaluate wrong AST node: " + node.data.kind + ", should be " + astKindMustBe);
                }
            }
            break;
        }
        case StkNodeKind.value: {
            if (node.kind !== StkNodeKind.value) {
                throw new Error("Eval Error: Evaluate wrong node: " + node.kind + ", should contain value");
            }
            break;
        }
        case StkNodeKind.address: {
            if (node.kind !== StkNodeKind.address) {
                throw new Error("Eval Error: Evaluate wrong node: " + node.kind + ", should contain address");
            }
            break;
        }
        case StkNodeKind.indicator: {
            if (node.kind !== StkNodeKind.indicator) {
                throw new Error("Eval Error: Evaluate wrong node: " + node.kind + ", should contain indicator");
            } else if (indicatorMustBe) {
                if (node.inst !== indicatorMustBe) {
                    throw new Error("Eval Error: Evaluate wrong indicator: " + node.inst + ", indicator should be " + indicatorMustBe);
                }
            }
            break;
        }
        default:
            break;
    }
    stk.pop();
    return node;
}
