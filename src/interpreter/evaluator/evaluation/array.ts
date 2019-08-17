/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The file for array evaluation
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/12-arrays.md
 * https://www.php.net/manual/en/language.types.array.php
 * https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#array-creation-operator
 */

import { Node } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode } from "../evaluator";
import { IArray } from "../memory";

/**
 * @example
 * array-creation-expression:
 *      array   (   array-initializer_optional   )
 *      [   array-initializer_optional   ]
 *
 * `ARRAY` keyword is non-case-sensitive in PHP
 * Array("abc" => "123", 1 => 123, ++$c  => "b");
 * [4, 6 => "123"];
 */
Evaluator.prototype.evaluateArray = function() {
    const arrayNode = this.stk.top.value; this.stk.pop();
    if (arrayNode.node.kind !== "array") {
        throw new Error("Eval Error: Evaluate wrong AST node: " + arrayNode.node.kind + ", should be array");
    }

    // `[1,2] = ...;` is illegal because this is a temporary value not in memory
    if (arrayNode.inst !== undefined && arrayNode.inst === "WRITE") {
        throw new Error("Fatal error: Assignments can only happen to writable values.");
    }

    const arrayVal: IArray = {
        elt: new Map(),
        idx: 0,
        type: "array",
    };

    for (let i = 0, item: Node = arrayNode.node.items[i]; i < arrayNode.node.items.length; i++) {
        /**
         * For multi-line arrays on the other hand the trailing comma is commonly used,
         * as it allows easier addition of new elements at the end. In this way AST node could be null.
         * But not allow empty elements in array, such as [,,,].
         */
        if ((item === null && i === 0) || (item === null && i !== arrayNode.node.items.length - 1)) {
            throw new Error("Fatal error: Cannot use empty array elements in arrays.");
        }

        /**
         * The key can either be an integer or a string.
         * - Strings containing valid decimal integers, unless the number is preceded by a + sign, will be cast to the integer type.
         * - Floats are also cast to integers, which means that the fractional part will be truncated.
         * - Bools are cast to integers, too, i.e. the key true will actually be stored under 1 and the key false under 0.
         * - Null will be cast to the empty string, i.e. the key null will actually be stored under "".
         * - Arrays and objects can not be used as keys. Doing so will result in a warning: Illegal offset type.
         * The value can be of any type.
         */
        if (item.kind === "entry") {
            // key
            this.stk.push({
                inst: "READ",
                node: item.key,
            });
            this.evaluate();
            const keyNode = this.stk.top.value; this.stk.pop();
            let key = keyNode.val;  // key could be number, string, boolean, unary, null(NULL)
            switch (typeof key) {
                case "boolean": {
                    key = Number(key);
                    arrayVal.idx = key >= arrayVal.idx ? key + 1 : arrayVal.idx;
                    break;
                }
                case "string": {
                    // check if it could be converted to number
                    const validDecInt = /^(|[-]?0|-[1-9][0-9]*)$/;    // "010" × | "10.0" × | "-10" √ | "-0" √ | "+0" ×
                    if (validDecInt.test(key)) {
                        key = Number(key);
                        arrayVal.idx = key >= arrayVal.idx ? key + 1 : arrayVal.idx;
                    }
                    break;
                }
                case "number": {
                    key = Math.trunc(key);  // maybe 0 and -0, but the storing map's key is string, they will all be 0
                    arrayVal.idx = key >= arrayVal.idx ? key + 1 : arrayVal.idx;
                    break;
                }
                default:
                    break;
            }

            // value
            this.stk.push({
                inst: "READ",
                node: item.value,
            });
            this.evaluate();
            const valNode = this.stk.top.value; this.stk.pop();
            const val = valNode.val;
            arrayVal.elt.set(key, val);
        } else {
            // could be single number, string, boolean, null, IArray, IObject
            this.stk.push({
                inst: "READ",
                node: item,
            });
            this.evaluate();
            const valNode = this.stk.top.value; this.stk.pop();
            const val = valNode.val;
            arrayVal.elt.set(arrayVal.idx, val);
            arrayVal.idx += 1;
        }
    }

    // need to push the result to the stack for possible next evaluation
    const stknode: IStkNode = {
        val: arrayVal,
    };
    this.stk.push(stknode);
};
