/**
 * @authors https://github.com/eou/php-interpreter
 * @description The file for assignment evaluation
 * @see https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#assignment
 */

import util = require("util");  // for test
import { Node } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode } from "../evaluator";

/**
 * @example
 * $a = 1;
 * $a += 1;
 * $a = $b;
 * $a = &$b;
 * $a = $b += $c -= 6;
 * $a[1] = 1;   offsetlookup, find in array.hstore
 * $a->x = 1;   propertylookup, find in object.hstore
 * a::$x = 1;   staticlookup, find in class.static
 * For the right side, there are 8 main types in PHP:
 *      boolean, interger, double, string;
 *      array, object;
 *      resource;
 *      null;
 * First 4 are scalar type which are only simple values
 * For object, there could be closure, instance
 * $a = function() {};
 * $a = new foo;
 */
Evaluator.prototype.evaluateAssign = function() {
    // split the top element into seperate steps, | left => operator => right |
    const assignNode = this.stk.top.value; this.stk.pop();
    if (assignNode.node.kind !== "assign") {
        throw new Error("Evaluate wrong AST node: " + assignNode.node.kind + ", should be assign");
    }

    this.stk.push({ node: assignNode.node.left });
    this.stk.push({ opts: assignNode.node.operator });
    this.stk.push({ node: assignNode.node.right });

    this.evaluate();    // evaluate right expressions and then push the value back into stack
    const rightNode = this.stk.top.value; this.stk.pop();
    if (rightNode.vals.pos === null) {
        // undefined variable
    }

    const operator = this.stk.top.value; this.stk.pop();
    this.evaluate();    // evaluate right expressions and then push the value back into stack
    const leftNode = this.stk.top.value; this.stk.pop();

    if (operator.opts.sign === "=") {
        if (leftNode.vals.loc === null) {

        }

        // search this variable in the current environment otherwise create a new one
        const currentEnv = this.env.env[this.env.idx];
        if (leftNode.node.kind === "variable") {
            // $a = ...;
            if (currentEnv.bind.vslot[leftNode.node.name] !== undefined) {
                // if the variable already exists, overwrite it
                const vslot = currentEnv.bind.vslot[leftNode.node.name];
                const vstore = currentEnv.bind.vstore[vslot.vstoreId];
                if (typeof rightNode.vals === "number" ||
                    typeof rightNode.vals === "string" ||
                    typeof rightNode.vals === "boolean") {
                    // scalar type value
                    vstore.type = typeof rightNode.vals;
                    vstore.val = rightNode.vals;
                    if (typeof rightNode.vals === "number") {
                        vstore.type = Number.isInteger(rightNode.vals) ? "integer" : "double";
                    }
                    // need to push a value to the stack for possible next evaluation
                    const stknode: IStkNode = {
                        vals: vstore.val,
                    };
                    this.stk.push(stknode);
                } else if (typeof rightNode.vals === "object") {
                    // object, array

                } else if (rightNode.node.kind === "variable") {
                    // variable

                }
            } else {
                // otherwise create a new one
                currentEnv.bind.vslot[leftNode.node.name] = { name: "", vstoreId: -1 };
                const vslot = currentEnv.bind.vslot[leftNode.node.name];
                vslot.name = leftNode.node.name;
                vslot.vstoreId = Object.keys(currentEnv.bind.vstore).length;
                currentEnv.bind.vstore[vslot.vstoreId] = { type: "", val: null,  hstoreId: null, refcount: 1 };
                const vstore = currentEnv.bind.vstore[vslot.vstoreId];
                if (typeof rightNode.vals === "number" ||
                    typeof rightNode.vals === "string" ||
                    typeof rightNode.vals === "boolean") {
                    vstore.type = typeof rightNode.vals;
                    vstore.val = rightNode.vals;
                    if (typeof rightNode.vals === "number") {
                        vstore.type = Number.isInteger(rightNode.vals) ? "integer" : "double";
                    }
                    // need to push a value to the stack for possible next evaluation
                    const stknode: IStkNode = {
                        vals: vstore.val,
                    };
                    this.stk.push(stknode);
                } else if (typeof rightNode.vals === "object") {

                }

            }
        } else if (leftNode.node.kind === "offsetlookup") {
            // $a[1] = ...;

        } else if (leftNode.node.kind === "propertylookup") {
            // $a->x = ...;

        } else {
            throw new Error("Unknown left expression type: " + leftNode.node.kind);
        }
    } else {
        // if it is combined operators, we convert it into common '=' operator, such as $a += 1 => $a = $a + 1
        const newExp = { kind: null, left: null, right: null, operator: null };
        Object.assign(newExp, assignNode.node);   // deep copy old expression
        newExp.operator = "=";

        const newRightNode = { kind: null, type: null, left: null, right: null };
        newRightNode.kind = "bin";
        newRightNode.type = operator.opts.split("=")[0];
        newRightNode.left = new Node();
        Object.assign(newRightNode.left, newExp.left);
        Object.assign(newRightNode.right, assignNode.node.right);
        newExp.right = newRightNode;

        const stknode: IStkNode = {
            node: newExp,
        };
        this.stk.push(stknode);
        this.evaluate();
    }
};
