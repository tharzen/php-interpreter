/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for binary operator evaluation
 */

import { Node } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode } from "../evaluator";

/**
 *
 */
Evaluator.prototype.evaluateBinary = function() {
    const binNode = this.stk.top.value; this.stk.pop();
    if (binNode.node.kind !== "bin") {
        throw new Error("Eval Error: Evaluate wrong AST node: " + binNode.node.kind + ", should be bin");
    }

};
