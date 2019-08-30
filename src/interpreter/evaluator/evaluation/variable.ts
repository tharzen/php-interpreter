/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The file for local variable evaluation
 * @see
 * https://www.php.net/manual/en/language.variables.basics.php
 * https://github.com/php/php-langspec/blob/master/spec/07-variables.md
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";
import { createVariable, getValue, ILocation, IVSlot, IVStore  } from "../memory";

/**
 * @example
 * Constant.                        "constantstatement"
 * Local variable.                  "variable"
 * Array element.                   "offsetlookup"
 * Function static.                 "static"
 * Global variable.                 "global"
 * Instance property.               "property"
 * Static class property.           "property"
 * Class and interface constant.    "classconstant"
 */
export const evaluateVariable = function(this: Evaluator) {
    const varNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "variable");

    // find the variable in current env
    let varEnv = this.env[this.cur];
    const stknode: IStkNode = {
        data: null,
        inst: null,
        kind: null,
    };
    const varname = varNode.data.name;
    let vslotAddr: number = varEnv.st._var.get(varname);
    if (varNode.inst === "getValue") {
        // get its value, could be boolean, number, string, IArray, IObject, closure (IFunction), null
        stknode.data = getValue(this.heap, vslotAddr);
        if (stknode.data === undefined) {
            this.log += ("Notice: Undefined variable: " + varname + "\n");
        }
        stknode.kind = StkNodeKind.value;
    } else if (varNode.inst === "getAddress") {
        let vslot: IVSlot;
        let vstore: IVStore;
        let vstoreAddr: number;
        let hstoreAddr: number;
        if (vslotAddr !== undefined) {
            vslot = this.heap.ram.get(vslotAddr);
            // check if it is global
            if (vslot.modifiers[0]) {
                varEnv = this.env[0];
            }
            vstoreAddr = vslot.vstoreAddr;
            vstore = this.heap.ram.get(vstoreAddr);
            hstoreAddr = vstore.hstoreAddr;     // maybe undefined
        } else {
            // create a new variable without any types
            const env = this.env[this.cur];
            const newVslotAddr = createVariable(this.heap, varname);
            this.heap.ram.get(newVslotAddr).modifiers[0] = this.cur === 0 ? true : false;   // global?
            env.st._var.set(varNode.data.name, newVslotAddr);
            vslotAddr = newVslotAddr;
            vstoreAddr = this.heap.ram.get(newVslotAddr).vstoreAddr;
            vstore = this.heap.ram.get(vstoreAddr);
        }
        // get its memory location
        const address: ILocation = {
            hstoreAddr,
            type: vstore.type,
            vslotAddr,
            vstoreAddr,
        };
        stknode.data = address;
        stknode.kind = StkNodeKind.address;
    }

    // need to push the result to the stack for possible next evaluation
    this.stk.push(stknode);
};
