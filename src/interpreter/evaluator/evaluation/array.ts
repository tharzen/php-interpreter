/**
 * @authors https://github.com/eou/php-interpreter
 * @description The file for array evaluation
 * @see https://github.com/php/php-langspec/blob/master/spec/12-arrays.md
 *      https://www.php.net/manual/en/language.types.array.php
 *      https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#array-creation-operator
 */

import { Node } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode } from "../evaluator";
import { IMap } from "../utils/map";

/**
 * @example
 * Array("abc" => "123", 1 => 123, ++$c  => "b");
 * [4, 6 => "123"];
 */
Evaluator.prototype.evaluateArray = function() {
    const arrayNode = this.stk.top.value; this.stk.pop();
    if (arrayNode.node.kind !== "array") {
        throw new Error("Eval Error: Evaluate wrong AST node: " + arrayNode.node.kind + ", should be array");
    }

    // `[1,2] = ...;` is illegal
    if (arrayNode.inst !== undefined && arrayNode.inst === "lval") {
        throw new Error("Fatal error: Assignments can only happen to writable values.");
    }

    const arrayVal: IArray = {
        idx: 0,
        name: arrayNode.node.name,
        val: {},
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
            this.stk.push({ node: item.key, val: null });
            this.evaluate();    // key could be number, string, boolean, unary, null(NULL)
            const keyNode = this.stk.top.value; this.stk.pop();
            let key = keyNode.val;
            switch (typeof key) {
                case "boolean": {
                    key = Number(key);
                    arrayVal.idx = key >= arrayVal.idx ? key + 1 : arrayVal.idx;
                    break;
                }
                case "string": {
                    // check if it could be converted to number
                    const validDecInt = /^(|[-]?0|-[1-9][0-9]*)$/;    // 010 × | 10.0 × | -10 √ | -0 √
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
            this.stk.push({ node: item.value, val: null });
            this.evaluate();
            const valNode = this.stk.top.value; this.stk.pop();
            const val = valNode.val;
            arrayVal.val[key] = val;
        } else {
            this.stk.push({ node: item, val: null });
            this.evaluate();
            const valNode = this.stk.top.value; this.stk.pop();
            // just like the right value in assignment which has different types
            // this is a temporary array model, we'll handle different objects when this array is saved to memory
            const val = valNode.val;
            arrayVal.val[arrayVal.idx] = val;
        }
    }

    // need to push the result to the stack for possible next evaluation
    const stknode: IStkNode = { res: arrayVal, val: null };
    this.stk.push(stknode);
};

// Array information extracted from the PHP source code
interface IArray {
    name: string;       // array name
    val: IMap<any>;    // array data
    idx: number;      // array number index
}
