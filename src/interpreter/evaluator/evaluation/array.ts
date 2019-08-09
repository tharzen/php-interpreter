/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for evaluate assignment expression.
 */

import { Evaluator } from "../evaluator";

/**
 * @description
 * Convert array on PHP to map object in the variable system.
 */
Evaluator.prototype.evaluateArray = function() {
    const topStkNode = this.stk.top; this.stk.pop();
    if (topStkNode.node.)
}