/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry of evaluator.
 */
import util = require("util");
import { Node as ASTNode } from "../php-parser/src/ast/node";
import { AST } from "../php-parser/src/index";
import { Env } from "./environment";
import { evaluateArray } from "./evaluation/array";
import { evaluateAssign } from "./evaluation/assign";
import { evaluateBinary } from "./evaluation/bin";
import { evaluateClass } from "./evaluation/class";
import { evaluateClosure } from "./evaluation/closure";
import { evaluateFunction } from "./evaluation/function";
import { evaluateGlobal } from "./evaluation/global";
import { evaluateEcho } from "./evaluation/internal/echo";
import { evaluateMethod } from "./evaluation/method";
import { evaluateOffset } from "./evaluation/offset";
import { evaluateVariable } from "./evaluation/variable";
import { Stack } from "./utils/stack";

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ EVALUATOR █████████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @property {AST}     ast - abstract syntax tree
 * @property {Map}     env - two environments which technically are scopes, global and local
 * @property {number}  cur - current environment index, 0 for global, 1 for local
 * @property {string}  res - final evaluation result, currently we assume it should always be string
 * @property {string}  log - logging notice, warning, any unfatal errors
 * @property {Stack}   stk - stack keeping a log of the functions which are called during the execution
 * @property {IHeap}   heap - storage, such as variable bindings, function declaration, class declaration, namespace location and etc.
 */
export class Evaluator {
    public ast: AST;
    public env: Env[];
    public cur: number;
    public res: string;
    public log: string;
    public stk: Stack<IStkNode>;
    public heap: IHeap;

    /**
     * @description
     * The main entry for running the evaluator
     */
    public run: () => string;

    /**
     * @description
     * Reorder the expressions, lift some of them, such as, functions are global
     */
    public lift: () => ASTNode[];

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
    public evaluateAssign = evaluateAssign;

    /**
     * @description
     * Evaluate array
     * @file
     * evaluator/evaluation/array.ts
     */
    public evaluateArray = evaluateArray;

    /**
     * @description
     * Evaluate class declaration
     * @file
     * evaluator/evaluation/class.ts
     */
    public evaluateClass = evaluateClass;

    /**
     * @description
     * Evaluate anonymous function
     * @file
     * evaluator/evaluation/closure.ts
     */
    public evaluateClosure = evaluateClosure;

    /**
     * @description
     * Evaluate user-defined function
     * @file
     * evaluator/evaluation/function.ts
     */
    public evaluateFunction = evaluateFunction;

    /**
     * @description
     * Evaluate the global variable
     * @file
     * evaluator/evaluation/global.ts
     */
    public evaluateGlobal = evaluateGlobal;

    /**
     * @description
     * Evaluate the function method
     * @file
     * evaluator/evaluation/method.ts
     */
    public evaluateMethod = evaluateMethod;

    /**
     * @description
     * Evaluate the offset of the array or string or object
     * @file
     * evaluator/evaluation/offset.ts
     */
    public evaluateOffset = evaluateOffset;

    /**
     * @description
     * Evaluate the local variable
     * @file
     * evaluator/evaluation/variable.ts
     */
    public evaluateVariable = evaluateVariable;

    /**
     * @description
     * Evaluate the binary operator
     * @file
     * evaluator/evaluation/bin.ts
     */
    public evaluateBinary = evaluateBinary;

    /**
     * @description
     * Evaluate the echo function
     * @file
     * evaluator/evaluation/internal/echo.ts
     */
    public evaluateEcho = evaluateEcho;

    constructor(ast: AST) {
        this.ast = ast;
        this.env = [new Env("global"), new Env("local")];
        this.cur = 0;
        this.res = "";
        this.log = "";
        this.stk = new Stack<IStkNode>();
        this.heap = {
            ptr: 0,
            ram: new Map(),
        };
    }
}

Evaluator.prototype.run = function() {
    // the root node of AST is "Program", its children field contains all expressions needed to be evaluated,
    // before pushing to stack, we need to LIFT some statements such as all functions,
    // classes without extends / implements / use, and all traits, all interfaces
    const reorderAST = this.lift();
    for (const astNode of reorderAST) {
        const stknode: IStkNode = {
            data: astNode,
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
    }
    while (this.stk.length() > 0) {
        this.evaluate();
    }
    console.log(util.inspect(this, { depth: null }));       // for test
    return this.res;
};

Evaluator.prototype.lift = function(): ASTNode[] {
    // use unshift but not push because last element push into stack should be evaluated first
    const reorderAST: ASTNode[] = [];
    this.ast.children.forEach((child: ASTNode) => {
        switch (child.kind) {
            case "function":
            case "trait":
            case "interface": {
                const stknode: IStkNode = {
                    data: child,
                    inst: null,
                    kind: StkNodeKind.ast,
                };
                this.stk.push(stknode);
                // evaluate them and save their declaration into heap
                this.evaluate();
                break;
            }
            case "class": {
                if (child.extends !== null || child.implements !== null) {
                    reorderAST.unshift(child);     // not normal class, do nothing
                } else {
                    let useTrait = false;
                    for (const classElt of child.body) {
                        if (classElt.kind === "traituse") {
                            useTrait = true;
                            break;
                        }
                    }
                    if (useTrait) {
                        reorderAST.unshift(child);     // not normal class, do nothing
                    } else {
                        // lift
                        const stknode: IStkNode = {
                            data: child,
                            inst: null,
                            kind: StkNodeKind.ast,
                        };
                        this.stk.push(stknode);
                        // evaluate class and save declaration into heap
                        this.evaluate();
                        break;
                    }
                }
                break;
            }
            default: {
                reorderAST.unshift(child);     // do nothing
                break;
            }
        }
    });
    return reorderAST;
};

Evaluator.prototype.evaluate = function() {
    // each time evaluate top element of stack
    const topNode: ASTNode = stkPop(this.stk, StkNodeKind.ast);
    const expr: ASTNode = topNode.data;
    const inst = topNode.inst;
    if (expr.kind === "expressionstatement") {
        // statements with a sequence point which followed a ';'
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
                    inst: "endAssign",
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
                    inst: "endVariable",
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
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateAssign();
    } else if (expr.kind === "variable") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateVariable();
    } else if (expr.kind === "array") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateArray();
    } else if (expr.kind === "function") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateFunction();
    } else if (expr.kind === "closure") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateClosure();
    } else if (expr.kind === "method") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateMethod();
    } else if (expr.kind === "global") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateGlobal();
    } else if (expr.kind === "offsetlookup") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateOffset();
    } else if (expr.kind === "echo") {
        const stknode: IStkNode = {
            data: expr,
            inst,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluateEcho();
    } else {
        throw new Error("Eval error: Unknown expression type: " + expr.kind);
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
 * { kind: "ast", data: {...}, inst: "getAddress" }
 * { kind: "value", data: false, inst: null }
 * { kind: "address", data: 15073, inst: null }
 * { kind: "indicator", data: null, inst: "endAssign" }
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
export function stkPop(stk: Stack<IStkNode>, kindMustBe: StkNodeKind, astKindMustBe?: string, indicatorMustBe?: string): IStkNode {
    const node = stk.top.value;
    switch (kindMustBe) {
        case StkNodeKind.ast: {
            if (node.kind !== StkNodeKind.ast) {
                throw new Error("Eval error: Evaluate wrong node: " + StkNodeKind[node.kind] + ", should contain AST node");
            } else if (astKindMustBe) {
                if (node.data.kind !== astKindMustBe) {
                    throw new Error("Eval error: Evaluate wrong AST node: " + node.data.kind + ", should be " + astKindMustBe);
                }
            }
            break;
        }
        case StkNodeKind.value: {
            if (node.kind !== StkNodeKind.value) {
                throw new Error("Eval error: Evaluate wrong node: " + StkNodeKind[node.kind] + ", should contain value");
            }
            break;
        }
        case StkNodeKind.address: {
            if (node.kind !== StkNodeKind.address) {
                throw new Error("Eval error: Evaluate wrong node: " + StkNodeKind[node.kind] + ", should contain address");
            }
            break;
        }
        case StkNodeKind.indicator: {
            if (node.kind !== StkNodeKind.indicator) {
                throw new Error("Eval error: Evaluate wrong node: " + StkNodeKind[node.kind] + ", should contain indicator");
            } else if (indicatorMustBe) {
                if (node.inst !== indicatorMustBe) {
                    throw new Error("Eval error: Evaluate wrong indicator: " + node.inst + ", indicator should be " + indicatorMustBe);
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
