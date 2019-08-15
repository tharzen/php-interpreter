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
    let varEnv = this.env.env[this.env.idx];
    const vslot = varEnv.bind.vslot[varNode.node.name];
    let vstore;
    let hstoreId;
    if (vslot !== undefined) {
        // check if it is global
        if (vslot.scope === "global") {
            varEnv = this.env.env[0];
        }
        vstore = varEnv.bind.vstore[vslot.vstoreId];
        hstoreId = vstore.hstoreId ? vstore.hstoreId : null;
    }

    const stknode: IStkNode = {};
    if (varNode.inst === "READ") {
        // need its value
        stknode.val = getValue(varEnv.bind, varNode.node.name);
    } else if (varNode.inst === "WRITE") {
        // need its memory location
        const loc: ILocation = {
            hstoreId,
            scope: vslot.scope,
            vslotName: varNode.node.name,
            vstoreId: vslot.vstoreId,
        };
        stknode.loc = [loc];
    }

    // need to push the result to the stack for possible next evaluation
    this.stk.push(stknode);
};
