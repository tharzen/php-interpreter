/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for assignment evaluation
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#assignment
 * https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#assignment-operators
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";
import { setValue } from "../memory";

/**
 * @example
 * assignment-expression:
 *      conditional-expression
 *      simple-assignment-expression
 *      compound-assignment-expression
 *
 * conditional-expression:
 *      coalesce-expression
 *      conditional-expression   ?   expressionopt   :   coalesce-expression
 * simple-assignment-expression:
 *      variable   =   assignment-expression
 *      list-intrinsic   =   assignment-expression
 * compound-assignment-expression:
 *      variable   compound-assignment-operator   assignment-expression
 * compound-assignment-operator: one of
 *      **=   *=   /=   %=   +=   -=   .=   <<=   >>=   &=   ^=   |=
 *
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
 *      array,
 *      object;
 *      resource;
 *      null;
 * First 4 are scalar type which are only simple values
 * For object, there could be closure, instance
 * $a = function() {};
 * $a = new foo;
 */
export const evaluateAssign = function(this: Evaluator) {
    const assignNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "assign");

    // ❗️ATTENTION: for the unparser, the original AST in php-parser has been changed, the `operator.sign` should be the operator
    if (assignNode.data.operator.sign === "=") {
        // $a = 1;
        // operator
        this.stk.push({
            data: null,
            inst: assignNode.data.operator.sign,
            kind: StkNodeKind.indicator,
        });
        // rval, if it is not byref, we need its value, otherwise we need its address
        if (assignNode.data.right.byref !== undefined && assignNode.data.right.byref) {
            // address
            this.stk.push({
                data: assignNode.data.right,
                inst: "getAddress",
                kind: StkNodeKind.ast,
            });
        } else {
            this.stk.push({
                data: assignNode.data.right,
                inst: "getValue",
                kind: StkNodeKind.ast,
            });
        }
        // lval: an expression that designates a location that can store a value
        this.stk.push({
            data: assignNode.data.left,
            inst: "getAddress",
            kind: StkNodeKind.ast,
        });
        // 🎈stack bottom => endAssign => '=' => right expr => left expr

        // evaluate left expressions and then push the address back into stack
        this.evaluate();
        let leftResult = stkPop(this.stk, StkNodeKind.address);
        const rightNode = this.stk.top.value; this.stk.pop();
        this.stk.push(leftResult);
        this.stk.push(rightNode);
        // 🎈stack bottom => endAssign => '=' => address => right expr

        // evaluate right expressions and then push the value back into stack
        this.evaluate();

        let rightResult = null;
        if (this.stk.top.value.kind === StkNodeKind.value) {
            // non-byref assignment
            rightResult = stkPop(this.stk, StkNodeKind.value);          // value
            leftResult = stkPop(this.stk, StkNodeKind.address);         // address
            stkPop(this.stk, StkNodeKind.indicator, undefined, "=");    // =
            // assignment
            // $a = $b; $b is undefined and $a is set to null
            rightResult.data = rightResult.data === undefined ? null : rightResult.data;
            if (leftResult.data.type === "string") {
                let rightChar = "";
                // this is a location of a character in one string
                switch (typeof rightResult.data) {
                    case "boolean": {
                        if (rightResult.data === true) {
                            rightChar = "1";
                        } else {
                            // $b = $a[3] = false; $b will be null!!!
                            rightResult.data = null;    // for next evaluation
                        }
                        break;
                    }
                    case "string": {
                        if (rightResult.data === "") {
                            this.log += ("Warning:  Cannot assign an empty string to a string offset\n");
                        }
                        rightChar = rightResult.data[0];
                        // $b = $a[3] = ""; $b will be null!!!
                        rightResult.data = null;    // for next evaluation
                        break;
                    }
                    case "number": {
                        rightChar = rightResult.data.toString()[0];
                        break;
                    }
                    case "object": {
                        if (rightResult.data === null) {
                            this.log += ("Warning:  Cannot assign an empty string to a string offset\n");
                        } else if (rightResult.data.type === "array") {
                            this.log += ("Notice: Array to string conversion\n");
                            rightChar = "A";   // first character of "Array"
                        } else if (rightResult.data.type === "object") {
                            throw new Error("Recoverable fatal error:  Object of class aa could not be converted to string\n");
                        } else {
                            throw new Error("Eval error: unidentified value when assigning a string\n");
                        }
                        break;
                    }
                    default: {
                        throw new Error("Eval error: unidentified value when assigning a string\n");
                    }
                }
                // assign
                const vslot = this.heap.ram.get(leftResult.data.vslotAddr);
                const vstore = this.heap.ram.get(vslot.vstoreAddr);
                while (leftResult.data.offset > vstore.val.length) {
                    vstore.val += " ";
                }
                vstore.val += rightChar;
            } else {
                setValue(this.heap, leftResult.data.vslotAddr, rightResult.data);
            }
        } else if (this.stk.top.value.kind === StkNodeKind.address) {
            // byref assignment
            rightResult = stkPop(this.stk, StkNodeKind.address);       // address
            leftResult = stkPop(this.stk, StkNodeKind.address);        // address
            stkPop(this.stk, StkNodeKind.indicator, undefined, "=");   // =
            const leftVslot = this.heap.ram.get(leftResult.data.vslotAddr);
            leftVslot.vstoreAddr = rightResult.data.vstoreAddr;
        }

        // check the expression end
        if (this.stk.top.value.inst === "endAssign") {
            this.stk.pop();
        } else {
            this.stk.push(rightResult);      // for next possible evaluation
        }
    } else {
        // if it is compound assignment operators, we convert it into common '=' operator, such as $a += 1 => $a = $a + 1
        // $a += &$c;
        // TODO: this error should be throwed from 'bin' evaluation
        if (assignNode.data.right.byref !== undefined && assignNode.data.right.byref) {
            throw new Error("Parse error: syntax error, unexpected '&'");   // not included in php-parser right now
        }

        const newExp = { kind: "", left: {}, right: {}, operator: ""};
        Object.assign(newExp, assignNode.data);   // deep copy old expression
        newExp.kind = "assign";
        newExp.operator = "=";
        Object.assign(newExp.left, assignNode.data.left);

        const newRightNode = { kind: "", type: "", left: {}, right: {} };
        newRightNode.kind = "bin";
        newRightNode.type = assignNode.data.operator.sign.split("=")[0];
        newRightNode.left = new ASTNode();
        Object.assign(newRightNode.left, assignNode.data.left);
        Object.assign(newRightNode.right, assignNode.data.right);
        newExp.right = newRightNode;

        const stknode: IStkNode = {
            data: newExp,
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
    }
};
