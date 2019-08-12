/**
 * @authors https://github.com/eou/php-interpreter
 * @description The file for offset evaluation (an element in an array)
 * @see https://www.php.net/manual/en/arrayaccess.offsetset.php
 *      https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#subscript-operator
 */

import { Node } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode } from "../evaluator";

/**
 * @description
 * subscript-expression:
 *      dereferencable-expression   [   expressionopt   ]
 * A subscript-expression designates a (possibly non-existent) element of an array or string or object of a type that implements `ArrayAccess`.
 */
Evaluator.prototype.evaluateOffset = function() {
    const offsetNode = this.stk.top.value; this.stk.pop();
    if (offsetNode.node.kind !== "offsetlookup") {
        throw new Error("Eval Error: Evaluate wrong AST node: " + offsetNode.node.kind + ", should be offsetlookup");
    }

    // `$a = $b[];`, `$b[$a[]] = 1;` is illegal
    if (offsetNode.inst !== undefined && offsetNode.inst === "rval" && !offsetNode.node.offset) {
        throw new Error("Fatal error:  Cannot use [] for reading.");
    }

    const offsetVal: IOffset = {
        defined: { deref: false, offset: false },
        global: false,
        loc: null,
        name: {
            deref: {
                name: offsetNode.node.what.name,
                type: null,
            },
            offset: {
                name: null,
            },
        },
        val: { type: null, val: undefined },
    };

    if (offsetNode.node.offset) {
        // could be false, e.g. $a[] = 1;
        this.stk.push({ node: offsetNode.node.offset, val: null, inst: "rval" });   // must be a rval since we need its value
    }
    this.stk.push({ opts: offsetNode.node.what, val: null });

    // evaluate 'what' which is the deref name, a "variable" AST node
    this.evaluate();
    const varNode = this.stk.top.value; this.stk.pop();
    if (varNode.res.defined) {
        // find the dereference
        offsetVal.defined.deref = true;
        offsetVal.global = varNode.res.global;
        offsetVal.loc.deref = varNode.res.loc;
        offsetVal.name.deref.type = varNode.res.type;   // could be string, array, object
    } else {
        // deref does not exist but if it is a array lval, the program will create a new array in next evaluation
        // need to push the result to the stack for possible next evaluation
        // this.stk.push({ res: offsetVal, val: null });
        // return;
    }

    // evaluate 'offset' which is a key in the deref, and it should be integer or string
    if (offsetNode.node.offset) {
        this.evaluate();
        const keyNode: Node = this.stk.top.value; this.stk.pop();
        let offsetName = keyNode.val;
        if (offsetName !== undefined) {
            if (typeof offsetName !== "number" && typeof offsetName !== "boolean" && typeof offsetName !== "string") {
                console.log("Warning: Illegal offset type");    // only warning but not terminate program
                offsetName = "";  // treat offset as null which is [] => 1
            }
            switch (typeof offsetName) {
                case "boolean": {
                    offsetName = Number(offsetName);
                    break;
                }
                case "string": {
                    // check if it could be converted to number
                    const validDecInt = /^(|[-]?0|-[1-9][0-9]*)$/;    // 010 × | 10.0 × | -10 √ | -0 √
                    if (validDecInt.test(offsetName)) {
                        offsetName = Number(offsetName);
                    }
                    break;
                }
                case "number": {
                    offsetName = Math.trunc(offsetName);  // maybe 0 and -0, but the storing map's key is string, they will all be 0
                    break;
                }
                default:
                    break;
            }
        }

        // find the target element in the deref
        const env = offsetVal.global ? this.env.env[0] : this.env.env[this.env.idx];
        const loc = offsetVal.loc.deref;
        if (offsetVal.name.deref.type === "string") {
            // The subscript operator can not be used on a string value in a byRef context
            if (offsetNode.node.what.byref) {
                throw new Error("Fatal error:  Uncaught Error: Cannot create references to/from string offsets.");
            }
            // If both dereferencable-expression and expression designate strings,
            // expression is treated as if it specified the int key zero instead and a non-fatal error is produces.
            if (typeof offsetName === "string") {
                offsetName = 0;
            }
            // string will be stored in vstore
            const vstore = env.bind.vstore[loc[1]];
            const str: string = vstore.val;
            if (offsetName < 0) {
                // If the integer is negative, the position is counted backwards from the end of the string
                offsetName += str.length;
            }
            offsetVal.val.type = "string";
            offsetVal.val.val = str[offsetName];    // if it still out of bound, there will be a undefined
        } else if (offsetVal.name.deref.type === "array") {
            const hstore = env.bind.hstore[loc[2]];     // get the array location
            if (hstore.data.vslot[offsetName] !== undefined) {
                const vslot = hstore.data.vslot[offsetName];
                offsetVal.defined.offset = true;
                offsetVal.name.offset.name = offsetName;
                offsetVal.val.type = hstore.data.vstore[vslot.vstoreId].type;
                offsetVal.val.val = hstore.data.vstore[vslot.vstoreId].val;     // maybe number, string, boolean or object
            } else {
                // legal offset but no such element in the array
                offsetVal.name.offset.name = offsetName;
                offsetVal.defined.offset = false;
            }
        } else {
            // object of a type that implements `ArrayAccess`
        }
    }

    // need to push the result to the stack for possible next evaluation
    const stknode: IStkNode = { res: offsetVal, val: offsetVal.val.val };
    this.stk.push(stknode);
};

interface IOffset {
    name: {
        deref: {
            name: string,
            type: string,   // array or string or object
        },
        offset: {
            name: number | string,
        },
    };                                             // name of deref and offset
    defined: { deref: boolean; offset: boolean };  // existence of the deref and the offset
    loc: { deref: any[]; offset: object; };        // memory location
    val: { type: string; val: any; };              // value of the element
    global: boolean;                               // if the deref is global
}
