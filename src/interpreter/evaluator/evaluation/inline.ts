/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for inline evaluation
 * @see
 * https://www.php.net/manual/en/language.basic-syntax.phpmode.php
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";

/**
 * @example
 * HTML codes
 */
export const evaluateInline = function(this: Evaluator) {
    const inlineNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "inline");

    // directly add into interpreter result
    this.res += inlineNode.data.raw;
};
