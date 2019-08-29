/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for array evaluation
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/12-arrays.md
 * https://www.php.net/manual/en/language.types.array.php
 * https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#array-creation-operator
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";
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
export const evaluateArray = function(this: Evaluator) {
    const arrayNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "array");

    // `[1,2] = ...;` is illegal because this is a temporary value not in memory
    if (arrayNode.inst !== undefined && arrayNode.inst === "getAddress") {
        throw new Error("Fatal error: Assignments can only happen to writable values.");
    }

    // evaluate array to IArray abstract model, a temporary object
    const arrayObj: IArray = {
        elt: new Map(),
        idx: 0,
        type: "array",
    };

    let i = 0;
    traverseArrayLoop:
    for (; i < arrayNode.data.items.length; i++) {
        /**
         * For multi-line arrays on the other hand the trailing comma is commonly used,
         * as it allows easier addition of new elements at the end. In this way AST node could be null.
         * But not allow empty elements in array, such as [,,,].
         */
        const item: ASTNode = arrayNode.data.items[i];
        if ((item === null && i === 0) || (item === null && i !== arrayNode.data.items.length - 1)) {
            throw new Error("Fatal error: Cannot use empty array elements in arrays.");
        }

        if (item.kind === "entry") {
            // key
            this.stk.push({
                data: item.key,
                inst: "getValue",
                kind: StkNodeKind.ast,
            });
            this.evaluate();
            const keyNode = stkPop(this.stk, StkNodeKind.value);
            let key = keyNode.data;  // key could be number, string, boolean, null
            /**
             * Key Cast!!!
             * The key can either be an integer or a string.
             * - Strings containing valid decimal integers, unless the number is preceded by a + sign, will be cast to the integer type.
             * - Floats are also cast to integers, which means that the fractional part will be truncated.
             * - Bools are cast to integers, too, i.e. the key true will actually be stored under 1 and the key false under 0.
             * - Null will be cast to the empty string, i.e. the key null will actually be stored under "".
             * - Arrays and objects can not be used as keys. Doing so will result in a warning: Illegal offset type.
             * The value can be of any type.
             */
            switch (typeof key) {
                case "boolean": {
                    key = Number(key);
                    arrayObj.idx = key >= arrayObj.idx ? key + 1 : arrayObj.idx;
                    break;
                }
                case "string": {
                    // check if it could be converted to number
                    const validDecInt = /^(|(-)?[1-9][0-9]*)$/;    // "010" × | "10.0" × | "-10" √ | "-0" √ | "+0" ×
                    if (validDecInt.test(key)) {
                        key = Number(key);
                        arrayObj.idx = key >= arrayObj.idx ? key + 1 : arrayObj.idx;
                    }
                    break;
                }
                case "number": {
                    key = Math.trunc(key);  // 0 maybe 0, +0, -0
                    key = key === -0 ? 0 : key;
                    arrayObj.idx = key >= arrayObj.idx ? key + 1 : arrayObj.idx;
                    break;
                }
                case "object": {
                    if (key === null) {
                        key = "";
                    } else if (key.type === "IArray") {
                        throw new Error("Fatal error:  Illegal offset type");
                    } else {
                        this.log += ("Warning:  Illegal offset type.\n");
                        continue traverseArrayLoop;     // do nothing with this array element
                    }
                    break;
                }
                default: {
                    this.log += ("Warning:  Illegal offset type.\n");
                    continue traverseArrayLoop;     // do nothing with this array element
                }
            }

            // value
            this.stk.push({
                data: item.value,
                inst: "getValue",
                kind: StkNodeKind.ast,
            });
            this.evaluate();
            const valNode = stkPop(this.stk, StkNodeKind.value);
            const val = valNode.data;
            arrayObj.elt.set(key, val);
        } else {
            // could be single number, string, boolean, null, IArray, IObject, IFunction (closure)
            this.stk.push({
                data: item,
                inst: "getValue",
                kind: StkNodeKind.ast,
            });
            this.evaluate();
            const valNode = stkPop(this.stk, StkNodeKind.value);
            const val = valNode.data;
            arrayObj.elt.set(arrayObj.idx, val);
            arrayObj.idx += 1;
        }
    }

    // need to push the result to the stack for possible next evaluation
    const stknode: IStkNode = {
        data: arrayObj,
        inst: null,
        kind: StkNodeKind.value,
    };
    this.stk.push(stknode);
};
