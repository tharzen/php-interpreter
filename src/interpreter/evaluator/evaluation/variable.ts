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
import { getValue, ILocation, IVSlot, IVStore  } from "../memory";

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
    let varEnv = this.env.get(this.cur);
    const stknode: IStkNode = {};
    const varname = varNode.node.name;
    let vslotAddr: number = varEnv.st._var.get(varname);
    if (varNode.inst === "READ") {
        // get its value, could be boolean, number, string, IArray, IObject, closure (IFunction), null
        stknode.val = getValue(vslotAddr, this.heap);
    } else if (varNode.inst === "WRITE") {
        let vslot: IVSlot;
        let vstore: IVStore;
        let vstoreAddr: number;
        let hstoreAddr: number;
        if (vslotAddr !== undefined) {
            vslot = this.heap.ram.get(vslotAddr);
            // check if it is global
            if (vslot.modifiers[0]) {
                varEnv = this.env.get(0);
            }
            vstoreAddr = vslot.vstoreAddr;
            vstore = this.heap.ram.get(vstoreAddr);
            hstoreAddr = vstore.hstoreAddr;     // maybe undefined
        } else {
            // create a new variable without any types
            const env = this.env.get(this.cur);
            const newVslotAddr = this.heap.ptr++;
            const newVstoreAddr = this.heap.ptr++;
            const newVslot: IVSlot = {
                modifiers: [false, false, false, false, false, false, false, false],
                name: varname,
                vstoreAddr: newVstoreAddr,
            };
            const newVstore: IVStore = {
                hstoreAddr: undefined,
                refcount: 1,
                type: null,
                val: null,
            };
            this.heap.ram.set(newVslotAddr, newVslot);
            this.heap.ram.set(newVstoreAddr, newVstore);
            env.st._var.set(varNode.node.name, newVslotAddr);
            vslotAddr = newVslotAddr;
            vstoreAddr = newVstoreAddr;
            vstore = newVstore;
        }
        // get its memory location
        const loc: ILocation = {
            env: vslot.modifiers[0] ? 0 : this.cur,
            hstoreAddr,
            type: vstore.type,
            vslotAddr,
            vstoreAddr,
        };
        stknode.loc = loc;
    }

    // need to push the result to the stack for possible next evaluation
    this.stk.push(stknode);
};
