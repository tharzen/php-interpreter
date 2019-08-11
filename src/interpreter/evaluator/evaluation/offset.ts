/**
 * @authors https://github.com/eou/php-interpreter
 * @description The file for offset evaluation (an element in an array)
 * @see https://www.php.net/manual/en/arrayaccess.offsetset.php
 */

import { Evaluator, IStkNode } from "../evaluator";

/**
 * @example
 * $a[1] = 1;
 * $a[$b[$c[$d]]] = 1;
 * $a["c"] = 1;
 * $a[] = 1;   // empty offset on the left is legal, illegal on the right
 */
Evaluator.prototype.evaluateOffset = function() {
    const offsetNode = this.stk.top.value; this.stk.pop();
    if (offsetNode.node.kind !== "offsetlookup") {
        throw new Error("Evaluate wrong AST node: " + offsetNode.node.kind + ", should be offsetlookup");
    }

    const offsetVal: IOffset = {
        defined: { array: false, offset: false },
        global: false,
        loc: null,
        val: null,
    };

    if (offsetNode.node.offset) {
        // could be false, e.g. $a[] = 1;
        this.stk.push({ node: offsetNode.node.offset, val: null });
    }
    this.stk.push({ opts: offsetNode.node.what, val: null });

    this.evaluate();    // evaluate 'what' which is the array name, a "variable" AST node
    const varNode = this.stk.top.value; this.stk.pop();
    if (varNode.res.defined) {
        offsetVal.defined.array = true;
        offsetVal.global = varNode.res.global;
        offsetVal.loc.array = varNode.res.loc;
    } else {
        // array does not exist
        
    }

    if (offsetNode.node.offset) {
        this.evaluate();    // evaluate 'offset' which is a key in the array, and it can only be integer or string
        const keyNode = this.stk.top.value; this.stk.pop();
        const env = offsetVal.global ? this.env.env[0] : this.env.env[this.env.idx];
        const loc = offsetVal.loc.array;
        const hstore = env.bind.hstore[loc[2]];     // find the array location
        if (hstore.data.vslot[keyNode.val] !== undefined) {
            const vslot = hstore.data.vslot[keyNode.val];
            offsetVal.defined.offset = true;
            offsetVal.val.type = hstore.data.vstore[vslot.vstoreId].type;
            offsetVal.val.val = hstore.data.vstore[vslot.vstoreId].val;     // maybe number, string, boolean or object
        } else {
            // offset exists but no such element
        }
    } else {
        // no offset

    }

    // need to push the value to the stack for possible next evaluation
    const stknode: IStkNode = { res: offsetVal, val: offsetVal.val.val };
    this.stk.push(stknode);
};

interface IOffset {
    defined: { array: boolean; offset: boolean };
    loc: { array: any[]; offset: object; };
    val: { type: string; val: any; };
    global: boolean;
}
