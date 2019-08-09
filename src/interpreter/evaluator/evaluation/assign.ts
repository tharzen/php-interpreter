/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for evaluate assignment expression.
 * @see https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#assignment
 */

import { Evaluator } from "../evaluator";

Evaluator.prototype.evaluateAssign = function() {
    // split the top element into seperate steps
    const topStkNode = this.stk.top; this.stk.pop();
    this.stk.push({ node: topStkNode.value.node.left });
    this.stk.push({ opts: topStkNode.value.node.operator });
    this.evaluate(topStkNode.value.node.right);     // evalute right expressions and then push the value back into stack

    // start
    const rightVal = this.stk.top.value; this.stk.pop();
    const operator = this.stk.top.value; this.stk.pop();
    const leftVal = this.stk.top.value; this.stk.pop();     // assume left value of the expression is always a variable
    if (operator.opts === "=") {
        // search this variable in the current environment otherwise new one
        const currentEnv = this.env.env.peekLast();
        if (currentEnv[leftVal.node.name] !== undefined) {
            // if the variable have already 
        } else {

        }
    }
};
