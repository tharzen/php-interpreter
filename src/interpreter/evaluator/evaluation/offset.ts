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
import { Evaluator, IStkNode } from "../evaluator";

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
    const offsetNode: ASTNode = this.stk.top.value; this.stk.pop();
    if (offsetNode.node.kind !== "offsetlookup") {
        throw new Error("Eval Error: Evaluate wrong AST node: " + offsetNode.node.kind + ", should be offsetlookup");
    }

    // `$a = $b[];`, `$b[$a[]] = 1;` is illegal
    if ((offsetNode.inst === undefined || offsetNode.inst !== "WRITE")
        && !offsetNode.node.offset) {
        throw new Error("Fatal error:  Cannot use [] for reading.");
    }

    const stknode: IStkNode = {};
    const inst = offsetNode.inst;   // READ or WRITE

    if (inst === "READ") {
        /**
         * READ
         * if `$a[1][2]` doesnt exist, it will print notice: Undefined variable: a and then return null, it won't create any new array
         */
        if (offsetNode.node.offset) {
            // could be false, e.g. $a[] = 1;
            this.stk.push({ node: offsetNode.node.offset, inst: "READ" });   // read offset value, e.g. $a, $a[1],
        }
        this.stk.push({ node: offsetNode.node.what, inst: "READ" });
        // evaluate 'what' which is the deref name, a "variable" or "array" or "string" AST node
        this.evaluate();
        const derefNode = this.stk.top.value; this.stk.pop();
        if (derefNode.val === undefined) {
            // cannot find this array or string
            console.error("Notice: Undefined variable " + offsetNode.node.what.name);
            stknode.val = null;
            this.stk.push(stknode);
            return;
        } else if (derefNode.val === null) {
            // do nothing
            stknode.val = null;
            this.stk.push(stknode);
            return;
        } else {
            // evaluate 'offset' which is a key in the deref, and it should be integer or string
            this.evaluate();
            const keyNode: ASTNode = this.stk.top.value; this.stk.pop();
            let offsetName = keyNode.val;
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
            if (typeof derefNode.val === "boolean" || typeof derefNode.val === "number") {
                // surprisingly, PHP won't throw any errors when you try to get an offset element from a number or boolean
                stknode.val = null;
                this.stk.push(stknode);
                return;
            } else if (typeof derefNode.val === "string") {
                // The subscript operator can not be used on a string value in a byRef context
                if (offsetNode.node.what.byref) {
                    throw new Error("Fatal error:  Uncaught Error: Cannot create references to/from string offsets.");
                }
                // If both dereferencable-expression and expression designate strings,
                // expression is treated as if it specified the int key zero instead and a non-fatal error is produces.
                if (typeof offsetName === "string") {
                    offsetName = 0;
                }
                const str: string = derefNode.val;
                if (offsetName < 0) {
                    // If the integer is negative, the position is counted backwards from the end of the string
                    offsetName += str.length;
                }
                if (str[offsetName] === undefined) {
                    console.error("Notice: Uninitialized string offset " + offsetName);
                }
                stknode.val = str[offsetName];  // if it still out of bound, there will be a undefined
                this.stk.push(stknode);
                return;
            } else if (typeof derefNode.val === "object" && derefNode.val.type === "IArray") {
                const array = derefNode.val.elt;
                if (array.size === 0 || array.get(offsetName) === undefined) {
                    console.error("Notice: Undefined offset: " + offsetName);
                    stknode.val = null;
                } else {
                    stknode.val = array.get(offsetName);
                }
                this.stk.push(stknode);
                return;
            } else if (typeof derefNode.val === "object" && derefNode.val.type === "IObject") {
                // TODO: any objects belonging to a class which implements `ArrayAccess`
            } else {
                throw new Error("Eval error: undefined dereferencable-expression type in reading offset");
            }
        }
    } else if (inst === "WRITE") {
        /**
         * WRITE
         * if `$a[][1][0]` doesnt exist, it will create a new array then assgin null to it, the empty offset will be 0
         */
        if (offsetNode.node.offset) {
            // could be false, e.g. $a[] = 1;
            this.stk.push({ node: offsetNode.node.offset, inst: "READ" });   // read offset value, e.g. $a, $a[1],
        }
        this.stk.push({ node: offsetNode.node.what, inst: "WRITE" });   // get the array or string or object's location
        // evaluate 'what' which is the deref name, a "variable" or "array" or "string" AST node
        this.evaluate();
        const derefNode = this.stk.top.value; this.stk.pop();
        // should be "variable" node, if it is a temporary value on the left of the assignment, it will throw fatal error before pushed into stack

        let offsetName = null;
        if (offsetNode.node.offset) {
            // evaluate 'offset' which is a key in the deref, and it should be integer or string
            this.evaluate();
            const keyNode: Node = this.stk.top.value; this.stk.pop();
            offsetName = keyNode.val;
            if (offsetName !== undefined) {
                if (typeof offsetName !== "number" && typeof offsetName !== "boolean" && typeof offsetName !== "string") {
                    if (offsetName === null) {
                        offsetName = "";  // treats null as "" which is [""] => xxx
                    } else {
                        console.error("Warning: Illegal offset type " + offsetName);    // only warning and do nothing but not terminate program
                        stknode.loc = undefined;
                        stknode.inst = "ILOC";  // illegal location, cannot get legal memory location, the evaluator should stop evaluating this part
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
        if (typeof derefNode.loc.type === "boolean" || typeof derefNode.loc.type === "number") {
            console.error("Warning:  Cannot use a scalar value as an array");
            stknode.loc = undefined;
            this.stk.push(stknode);
            return;
        } else if (typeof derefNode.loc.type === "string") {
            // The subscript operator can not be used on a string value in a byRef context
            if (offsetNode.node.what.byref) {
                throw new Error("Fatal error:  Uncaught Error: Cannot create references to/from string offsets.");
            }
            // If both dereferencable-expression and expression designate strings,
            // expression is treated as if it specified the int key zero instead and a non-fatal error is produces.
            if (typeof offsetName === "string") {
                offsetName = 0;
            }
            if (typeof this.heap.ram.get(derefNode.loc.vstoreAddr).val !== "string") {
                throw new Error("Eval Error: wrong type in writing string offset");
            }

            const str: string = this.heap.ram.get(derefNode.loc.vstoreAddr).val;
            if (offsetName < 0) {
                // If the integer is negative, the position is counted backwards from the end of the string
                offsetName += str.length;
                // $a = "abc"; $a[-10] = "d";
                if (offsetName < 0) {
                    console.error("Warning: Illegal string offset " + offsetName);
                }
            }

            const loc = derefNode.loc;
            loc.offset = offsetName;
            stknode.loc = loc;
            this.stk.push(stknode);
            return;
        } else if (derefNode.loc.type === "array") {
            const loc = derefNode.loc;
            const hstore = this.heap.ram.get(derefNode.loc.hstoreAddr);
            const offsetVslotAddr = hstore.data.get(offsetName);
            if (offsetVslotAddr === undefined) {
                // $a exists but $a[x] does not, since it is a write operation, we need create a new offset in this array
                const newVslotAddr = this.heap.ptr++;
                const newVstoreAddr = this.heap.ptr++;
                const newVslot = {
                    modifiers: [false, false, false, false, false, false, false, false],
                    name: offsetName,
                    vstoreAddr: newVstoreAddr,
                };
                const newVstore = {
                    hstoreAddr: undefined,
                    refcount: 1,
                    type: null,
                    val: null,
                };
                this.heap.ram.set(newVslotAddr, newVslot);
                this.heap.ram.set(newVstoreAddr, newVstore);
                hstore.data.set(offsetName, newVslotAddr);
            }
            const vslot = this.heap.ram.get(offsetVslotAddr);
            const vstore = this.heap.ram.get(vslot.vstoreAddr);
            loc.type = vstore.type;
            loc.vslotAddr = offsetVslotAddr;
            loc.vstoreAddr = vslot.vstoreAddr;
            loc.hstoreAddr = this.heap.ram.get(vstore.hstoreAddr);
            this.stk.push(stknode);
            return;
        } else if (derefNode.loc.type === "object") {
            // TODO: any objects belonging to a class which implements `ArrayAccess`
        } else if (derefNode.loc.type === "null") {
            if (derefNode.loc.hstoreAddr !== undefined) {
                // $a = null; $a already exists in memory, but $a is not an array
                this.env.get(derefNode.loc.idx).st._var.get
            } else {
                // need to create a new array
                const newVslotAddr = this.heap.ptr++;
                const newVstoreAddr = this.heap.ptr++;
                const newHstoreAddr = this.heap.ptr++;
                const newVslot = {
                    modifiers: [false, false, false, false, false, false, false, false],
                    name: offsetNode.node.what.name,
                    vstoreAddr: newVstoreAddr,
                };
                const newVstore = {
                    hstoreAddr: newHstoreAddr,
                    refcount: 1,
                    type: "array",
                    val: null,
                };
                this.env.get(this.cur).st._var.set(offsetNode.node.what.name, newVslotAddr);
                const newHstore = {
                    data: new Map(),
                    meta: 0,
                    refcount: 1,
                    type: "array",
                };
                this.heap.ram.set(newVslotAddr, newVslot);
                this.heap.ram.set(newVstoreAddr, newVstore);
                this.heap.ram.set(newHstoreAddr, newHstore);
            }
        } else {
            throw new Error("Eval error: undefined type dereferencable-expression in writing offset");
        }
    } else {
        throw new Error("Eval error: " + inst +  " instruction in offset Node");
    }
};
