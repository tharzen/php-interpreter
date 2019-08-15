/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The file for local variable evaluation
 * @see
 * https://www.php.net/manual/en/language.variables.basics.php
 * https://github.com/php/php-langspec/blob/master/spec/07-variables.md
 */

import util = require("util");  // for test
import { Evaluator, IStkNode } from "../evaluator";
import { getValue, ILocation  } from "../memory";

/**
 * @example
 * Constant.                        "constantstatement"
 * Local variable.
 * Array element.                   "offsetlookup"
 * Function static.                 "static"
 * Global variable.                 "global"
 * Instance property.               "property"
 * Static class property.           "property"
 * Class and interface constant.    "classconstant"
 */
Evaluator.prototype.evaluateVariable = function() {
    const varNode = this.stk.top.value; this.stk.pop();
    if (varNode.node.kind !== "variable") {
        throw new Error("Eval Error: Evaluate wrong AST node: " + varNode.node.kind + ", should be variable");
    }

    // find the variable in current env
    let varEnv = this.env.get(this.idx);
    const vslot = varEnv.heap._var.vslot.get(varNode.node.name);
    let vstore;
    let hstoreId;
    if (vslot !== undefined) {
        // check if it is global
        if (vslot.modifiers[0]) {
            varEnv = this.env.get(0);
        }
        vstore = varEnv.heap._var.vstore.get(vslot.vstoreId);
        hstoreId = vstore.hstoreId ? vstore.hstoreId : undefined;
    }

    const stknode: IStkNode = {};
    if (varNode.inst === "READ") {
        // get its value
        // could be boolean, number, string, IArray, IObject, closure (IFunction), null
        stknode.val = getValue(varEnv.heap._var, varNode.node.name);
    } else if (varNode.inst === "WRITE") {
        // get its memory location
        const loc: ILocation = {
            hstoreId,
            idx: vslot.modifiers[0] ? 0 : this.idx,
            vslotName: varNode.node.name,
            vstoreId: vslot.vstoreId,
        };
        stknode.loc = [loc];
    }

    // need to push the result to the stack for possible next evaluation
    this.stk.push(stknode);
};
