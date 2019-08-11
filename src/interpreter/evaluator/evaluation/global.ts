/**
 * @authors https://github.com/eou/php-interpreter
 * @description The file for `global` evaluation
 * @see https://www.php.net/language.variables.scope
 */

import { Node } from "../../php-parser/src/ast/node";
import { Evaluator } from "../evaluator";

/**
 * @example
 * global $a, $b;
 */
Evaluator.prototype.evaluateGlobal = function() {
    const globalNode = this.stk.top.value; this.stk.pop();
    if (globalNode.node.kind !== "global") {
        throw new Error("Evaluate wrong AST node: " + globalNode.node.kind + ", should be global");
    }

    const varEnv = this.env.env[this.env.idx];
    const globalEnv = this.env.env[0];
    globalNode.node.items.forEach((varname: Node) => {
        let globalVslot = globalEnv.bind.vslot[varname];
        if (globalVslot === undefined) {
            // if this global variable does not exist, create a new one
            globalVslot = {
                global: true,
                name: varname,
                vstoreId: Object.keys(globalEnv.bind.vstore).length,
            };
            globalEnv.bind.vstore[globalVslot.vstoreId] = {
                hstoreId: null,
                refcount: 1,
                type: "",
                val: null,
            };
        }

        let vslot = varEnv.bind.vslot[varname];
        if (vslot === undefined) {
            // if this local variable does not exist, create a new one
            vslot = {
                global: true,
                name: varname,
                vstoreId: globalVslot.vstoreId, // make a reference to the global one
            };
        } else {
            vslot.global = true;
            vslot.vstoreId = globalVslot.vstoreId;
        }
    });
    // Finally we do nothing on execution stack because this keyword only modify environment bindings.
};
