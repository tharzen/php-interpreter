/**
 * @authors https://github.com/eou/php-interpreter
 * @description The file for `global` evaluation
 * @see https://www.php.net/language.variables.scope
 *      https://github.com/php/php-langspec/blob/master/spec/07-variables.md#global-variables
 */

import { Node } from "../../php-parser/src/ast/node";
import { Evaluator } from "../evaluator";

/**
 * @example
 * global-declaration:
 *      global   variable-name-list   ;
 * variable-name-list:
 *      simple-variable
 *      variable-name-list   ,   simple-variable
 *
 * global $a, $b;
 * $GLOBALS['gv'] = 1;
 * One of the predefined variables, $GLOBALS is a superglobal array whose elements' key/value pairs contain the name and value,
 * respectively, of each global variable currently defined.
 */
Evaluator.prototype.evaluateGlobal = function() {
    const globalNode = this.stk.top.value; this.stk.pop();
    if (globalNode.node.kind !== "global") {
        throw new Error("Eval Error: Evaluate wrong AST node: " + globalNode.node.kind + ", should be global");
    }

    const varEnv = this.env.env[this.env.idx];
    const globalEnv = this.env.env[0];
    globalNode.node.items.forEach((varname: Node) => {
        let globalVslot = globalEnv.bind.vslot[varname];
        if (globalVslot === undefined) {
            // if this global variable does not exist, create a new one
            globalVslot = {
                name: varname,
                scope: "global",
                vstoreId: Object.keys(globalEnv.bind.vstore).length,
            };
            globalEnv.bind.vstore[globalVslot.vstoreId] = {
                hstoreId: null,
                refcount: 1,
                type: null,
                val: undefined,
            };
        }

        let vslot = varEnv.bind.vslot[varname];
        if (vslot === undefined) {
            // if this local variable does not exist, create a new one
            vslot = {
                name: varname,
                scope: "global",
                vstoreId: globalVslot.vstoreId, // make a reference to the global one
            };
        } else {
            vslot.scope = "global";
            vslot.vstoreId = globalVslot.vstoreId;
        }
    });
    // Finally we do nothing on execution stack because this keyword only modify environment bindings.
};
