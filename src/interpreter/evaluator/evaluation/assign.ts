/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for assignment evaluation
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/04-basic-concepts.md#assignment
 * https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#assignment-operators
 */

import util = require("util");  // for test
import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { evalStkPop, Evaluator, IStkNode, StkNodeKind } from "../evaluator";
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
Evaluator.prototype.evaluateAssign = function() {
    // split the top element into seperate steps, | left => right => operator |
    const assignNode = evalStkPop(this.stk, StkNodeKind.ast, "assign");

    // ATTENTION: for the unparser purpose, the source code of AST in php-parser has been changed
    // the `operator.sign` is the operator
    if (assignNode.data.operator.sign === "=") {
        // $a = 1;
        // operator
        this.stk.push({
            data: null,
            inst: assignNode.data.operator,
            kind: StkNodeKind.indicator,
        });
        // rval, we simply need its value
        this.stk.push({
            data: assignNode.data.right,
            inst: "getValue",
            kind: StkNodeKind.ast,
        });
        // lval: an expression that designates a location that can store a value
        this.stk.push({
            data: assignNode.data.left,
            inst: "getAddress",
            kind: StkNodeKind.ast,
        });
        // stack bottom => endOfAssign => '=' => right expr => left expr

        // evaluate left expressions and then push the address back into stack
        this.evaluate();
        let leftAddress = evalStkPop(this.stk, StkNodeKind.address);
        const rightNode = this.stk.top.value; this.stk.pop();
        this.stk.push(leftAddress);
        this.stk.push(rightNode);
        // stack bottom => endOfAssign => '=' => address => right expr

        // evaluate right expressions and then push the value back into stack
        this.evaluate();
        const rightValue = evalStkPop(this.stk, StkNodeKind.value);     // value
        leftAddress = evalStkPop(this.stk, StkNodeKind.address);        // address
        const operator = evalStkPop(this.stk, StkNodeKind.indicator);   // =

        // assignment
        setValue(this.heap, leftAddress.data.vslotAddr, rightValue);
    } else {
        // if it is compound assignment operators, we convert it into common '=' operator, such as $a += 1 => $a = $a + 1
        const newExp = { kind: null, left: null, right: null, operator: null };
        Object.assign(newExp, assignNode.data);   // deep copy old expression
        newExp.operator = "=";

        const newRightNode = { kind: null, type: null, left: null, right: null };
        newRightNode.kind = "bin";
        newRightNode.type = assignNode.data.operator.sign.split("=")[0];
        newRightNode.left = new ASTNode();
        Object.assign(newRightNode.left, newExp.left);
        Object.assign(newRightNode.right, assignNode.data.right);
        newExp.right = newRightNode;

        const stknode: IStkNode = {
            data: newExp,
            inst: null,
            kind: StkNodeKind.ast,
        };
        this.stk.push(stknode);
        this.evaluate();
    }
};
