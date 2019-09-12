/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for if statement
 * @see
 *
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";

/**
 * @example
 */
export const evaluateIf = function(this: Evaluator) {
    const ifNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "if");

};
