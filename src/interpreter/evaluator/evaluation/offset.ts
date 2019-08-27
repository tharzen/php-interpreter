/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for offset evaluation (an element in an array or a string)
 * @see
 * https://www.php.net/manual/en/arrayaccess.offsetset.php
 * https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#subscript-operator
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { evalStkPop, Evaluator, IStkNode, StkNodeKind } from "../evaluator";
import { createVariable } from "../memory";

/**
 * @description
 * subscript-expression:
 *      dereferencable-expression   [   expression_optional   ]
 * dereferencable-expression:
 *      variable
 *      (   expression   )
 *      array-creation-expression
 *      string-literal
 * A subscript-expression designates a (possibly non-existent) element of an array or string or object of a type that implements `ArrayAccess`.
 */
Evaluator.prototype.evaluateOffset = function() {
    const offsetNode: ASTNode = evalStkPop(this.stk, StkNodeKind.ast, "offsetlookup");

    // `$a = $b[];`, `$b[$a[]] = 1;` is illegal
    if ((offsetNode.inst === undefined || offsetNode.inst !== "getAddress")
        && !offsetNode.node.offset) {
        throw new Error("Fatal error:  Cannot use [] for reading.");
    }

    const stknode: IStkNode = {
        data: null,
        inst: null,
        kind: null,
    };
    const inst = offsetNode.inst;   // getValue or getAddress

    if (inst === "getValue") {
        /**
         * READ
         * if `$a[1][2]` doesnt exist, it will print notice: Undefined variable: a and then return null, it won't create any new array
         */
        if (offsetNode.node.offset) {
            // could be false, e.g. $a[] = 1;
            this.stk.push({
                data: offsetNode.data.offset,
                inst: "getValue",
                kind: StkNodeKind.ast,
            });   // read offset value, e.g. $a, $a[1],
        }
        this.stk.push({
            data: offsetNode.node.what,
            inst: "getValue",
            kind: StkNodeKind.ast,
        });

        // evaluate 'what' which is the deref name, a "variable" or "array" or "string" AST node
        this.evaluate();
        const derefNode = this.stk.top.value; this.stk.pop();
        if (derefNode.data === undefined) {
            // cannot find this array or string, need to throw a warning
            console.error("Notice: Undefined variable " + offsetNode.node.what.name);
            stknode.data = null;
            this.stk.push(stknode);
            return;
        } else if (derefNode.data === null) {
            // do nothing
            stknode.data = null;
            this.stk.push(stknode);
            return;
        } else {
            // array or string exists
            // evaluate 'offset' which is a key in the deref, and it should be integer or string
            this.evaluate();
            const keyNode: ASTNode = this.stk.top.value; this.stk.pop();
            let offsetName = keyNode.data;
            if (offsetName !== undefined) {
                if (typeof offsetName !== "number" && typeof offsetName !== "boolean" && typeof offsetName !== "string") {
                    console.error("Warning: Illegal offset type " + offsetName);    // only warning but not terminate program
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
            if (typeof derefNode.data === "boolean" || typeof derefNode.data === "number") {    // illegal type
                /**
                 * $a = false; $c = $a[3]; // $c is a new variable which assigned with null
                 * ❗️Surprisingly, PHP won't throw any errors when you try to get an offset element from a number or boolean
                 */
                stknode.data = null;
                this.stk.push(stknode);
                return;
            } else if (typeof derefNode.data === "string") {    // string
                // The subscript operator can not be used on a string value in a byRef context
                if (offsetNode.node.what.byref) {
                    throw new Error("Fatal error:  Uncaught Error: Cannot create references to/from string offsets.");
                }
                // If both dereferencable-expression and expression designate strings,
                // expression is treated as if it specified the int key zero instead and a non-fatal error is produces.
                if (typeof offsetName === "string") {
                    offsetName = 0;
                }
                const str: string = derefNode.data;
                if (offsetName < 0) {
                    // If the integer is negative, the position is counted backwards from the end of the string
                    offsetName += str.length;
                }
                if (str[offsetName] === undefined) {
                    console.error("Notice: Uninitialized string offset " + offsetName);
                }
                stknode.data = str[offsetName];  // if it still out of bound, there will be a undefined
                this.stk.push(stknode);
                return;
            } else if (typeof derefNode.data === "object" && derefNode.data.type === "IArray") {    // array
                const array = derefNode.data.elt;
                if (array.size === 0 || array.get(offsetName) === undefined) {
                    console.error("Notice: Undefined offset: " + offsetName);
                    stknode.data = null;
                } else {
                    stknode.data = array.get(offsetName);
                }
                this.stk.push(stknode);
                return;
            } else if (typeof derefNode.data === "object" && derefNode.data.type === "IObject") {   // object
                // TODO: any objects belonging to a class which implements `ArrayAccess`
            } else {
                throw new Error("Eval error: undefined dereferencable-expression type in reading offset");
            }
        }
    } else if (inst === "getAddress") {
        /**
         * WRITE
         * if `$a[][1][0]` doesnt exist, it will create a new array then assgin null to it, the empty offset will be 0
         */
        if (offsetNode.node.offset) {
            // could be false, e.g. $a[] = 1;
            this.stk.push({
                data: offsetNode.node.offset,
                inst: "getValue",
                kind: StkNodeKind.ast,
            });   // read offset value, e.g. $a, $a[1],
        }
        this.stk.push({
            data: offsetNode.node.what,
            inst: "getAddress",
            kind: StkNodeKind.ast,
        });   // get the array or string or object's location

        // evaluate 'what' which is the deref name, a "variable" or "array" or "string" AST node
        this.evaluate();
        const derefNode = this.stk.top.value; this.stk.pop();
        // should be "variable" node, if it is a temporary value on the left of the assignment, it will throw fatal error before pushed into stack

        let offsetName = null;
        if (offsetNode.node.offset) {
            // evaluate 'offset' which is a key in the deref, and it should be integer or string
            this.evaluate();
            const keyNode: ASTNode = this.stk.top.value; this.stk.pop();
            offsetName = keyNode.val;
            if (offsetName !== undefined) {
                if (typeof offsetName !== "number" && typeof offsetName !== "boolean" && typeof offsetName !== "string") {
                    if (offsetName === null) {
                        offsetName = "";  // treats null as "" which is [""] => xxx
                    } else {
                        // illegal location, cannot get legal memory location, the evaluator should stop evaluating this part
                        console.error("Warning: Illegal offset type " + offsetName);    // only warning and do nothing, not terminate program
                        stknode.data = undefined;
                        stknode.kind = StkNodeKind.address;
                        // stknode.inst = ""; // instruction unsure ???
                        this.stk.push(stknode);
                        return;
                    }
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
                        offsetName = Math.trunc(offsetName);  // maybe 0 and -0
                        offsetName = offsetName === -0 ? 0 : offsetName;
                        break;
                    }
                    default:
                        break;
                }
            } else {
                // $a[$c] = 1;
                console.error("Notice: Undefined variable " + offsetNode.node.offset.name);
                offsetName = "";
            }
        } else {
            offsetName = 0;
        }

        // Now there is deref location and offset name, we can get memory location
        if (typeof derefNode.data.type === "boolean" || typeof derefNode.data.type === "number") {
            console.error("Warning:  Cannot use a scalar value as an array");
            stknode.data = undefined;
            this.stk.push(stknode);
            return;
        } else if (typeof derefNode.data.type === "string") {
            // The subscript operator can not be used on a string value in a byRef context
            if (offsetNode.node.what.byref) {
                throw new Error("Fatal error:  Uncaught Error: Cannot create references to/from string offsets.");
            }
            // If both dereferencable-expression and expression designate strings,
            // expression is treated as if it specified the int key zero instead and a non-fatal error is produces.
            if (typeof offsetName === "string") {
                offsetName = 0;
            }
            if (typeof this.heap.ram.get(derefNode.data.vstoreAddr).val !== "string") {
                throw new Error("Eval Error: wrong type in writing string offset");
            }

            const str: string = this.heap.ram.get(derefNode.data.vstoreAddr).val;
            if (offsetName < 0) {
                // If the integer is negative, the position is counted backwards from the end of the string
                offsetName += str.length;
                // $a = "abc"; $a[-10] = "d";
                if (offsetName < 0) {
                    console.error("Warning: Illegal string offset " + offsetName);
                }
            }

            const loc = derefNode.data;
            loc.offset = offsetName;
            stknode.data = loc;
            stknode.kind = StkNodeKind.address;
            this.stk.push(stknode);
            return;
        } else if (derefNode.data.type === "array") {
            const loc = derefNode.data;
            const hstore = this.heap.ram.get(derefNode.data.hstoreAddr);
            const offsetVslotAddr = hstore.data.get(offsetName);
            if (offsetVslotAddr === undefined) {
                // $a exists but $a[x] does not, since it is a write operation, we need create a new offset element in this array
                const newOffsetVslotAddr = createVariable(this.heap, offsetName, null);
                hstore.data.set(offsetName, newOffsetVslotAddr);
            }
            const vslot = this.heap.ram.get(hstore.data.get(offsetName));
            const vstore = this.heap.ram.get(vslot.vstoreAddr);
            loc.type = vstore.type;
            loc.vslotAddr = offsetVslotAddr;
            loc.vstoreAddr = vslot.vstoreAddr;
            loc.hstoreAddr = vstore.hstoreAddr;
            stknode.data = loc;
            stknode.kind = StkNodeKind.address;
            this.stk.push(stknode);
            return;
        } else if (derefNode.data.type === "object") {
            // TODO: any objects belonging to a class which implements `ArrayAccess`
        } else if (derefNode.data.type === "null") {
            // $a = null; $a[6] = 1;
            // $a already exists in memory, but $a is not an array
            let hstore = null;
            if (derefNode.data.hstoreAddr !== undefined) {
                // this variable might have hstore address, but I think null variable should not have hstore
                const derefVstore = this.heap.ram.get(derefNode.data.vstoreAddr);
                const derefHstore = this.heap.ram.get(derefNode.data.hstoreAddr);
                derefVstore.type = "array";
                derefVstore.val = null;
                derefHstore.type = "array";
                derefHstore.meta = 0;
                derefHstore.data = new Map();
                hstore = derefHstore;
            } else {
                // need to create a new array
                const newVslotAddr = createVariable(this.heap, offsetNode.node.what.name, "array");
                this.env[this.cur].st._var.set(offsetNode.node.what.name, newVslotAddr);
                const newVstoreAddr = this.heap.ram.get(newVslotAddr).vstoreAddr;
                hstore = this.heap.ram.get(this.heap.ram.get(newVstoreAddr).hstoreAddr);
                hstore.meta = 0;
            }
            // create offset element
            const newOffsetVslotAddr = createVariable(this.heap, offsetName, null);
            hstore.data.set(offsetName, newOffsetVslotAddr);
            const vslot = this.heap.ram.get(hstore.data.get(offsetName));
            const vstore = this.heap.ram.get(vslot.vstoreAddr);
            const loc = derefNode.data;
            loc.type = vstore.type;
            loc.vslotAddr = newOffsetVslotAddr;
            loc.vstoreAddr = vslot.vstoreAddr;
            loc.hstoreAddr = vstore.hstoreAddr;
            stknode.data = loc;
            stknode.kind = StkNodeKind.address;
            this.stk.push(stknode);
            return;
        } else {
            throw new Error("Eval error: undefined type dereferencable-expression in writing offset");
        }
    } else {
        throw new Error("Eval error: " + inst +  " instruction in offset Node");
    }
};
