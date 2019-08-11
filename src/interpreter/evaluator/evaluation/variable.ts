/**
 * @authors https://github.com/eou/php-interpreter
 * @description The file for variables evaluation
 * @see https://www.php.net/manual/en/language.variables.basics.php
 */

import util = require("util");  // for test
import { Evaluator, IStkNode } from "../evaluator";

Evaluator.prototype.evaluateVariable = function() {
    const varNode = this.stk.top.value; this.stk.pop();
    if (varNode.node.kind !== "variable") {
        throw new Error("Evaluate wrong AST node: " + varNode.node.kind + ", should be variable");
    }

    const varVal: IVar = {
        defined: false,
        global: false,
        loc: null,
        name: varNode.node.name,
        type: null,
        val: null,
    };

    // find the variable in current env
    let varEnv = this.env.env[this.env.idx];
    const vslot = varEnv.bind.vslot[varVal.name];
    if (vslot !== undefined) {
        varVal.defined = true;
        // check if it is global
        if (vslot.global) {
            varEnv = this.env.env[0];
            varVal.global = true;
        }
        const vstore = varEnv.bind.vstore[vslot.vstoreId];
        varVal.type = vstore.type;
        varVal.loc = [varVal.name, vslot.vstoreId, vstore.hstoreId];
        // if hstore id exists, there has to be an array or object but not a value
        // here we don't continue getting the whole object since it maybe inefficient thus `{}` is ambiguous
        varVal.val = vstore.val ? vstore.val : {};
    }

    // need to push the value to the stack for possible next evaluation
    const stknode: IStkNode = { res: varVal, val: varVal.val };
    this.stk.push(stknode);
};

// Variable information extracted from the variable model
interface IVar {
    name: string;       // variable name
    type: string;       // variable type
    loc: any[];         // variable position: [vslotName, vstoreId, hstoreId]
    val: any;           // variable value
    global: boolean;    // variable scope
    defined: boolean;   // variable existence
}
