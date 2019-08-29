/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for `global` evaluation
 * @see
 * https://www.php.net/language.variables.scope
 * https://github.com/php/php-langspec/blob/master/spec/07-variables.md#global-variables
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, StkNodeKind, stkPop } from "../evaluator";
import { IVSlot, IVStore } from "../memory";

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
export const evaluateGlobal = function(this: Evaluator) {
    const globalNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "global");

    const varEnv = this.env[this.cur];
    const globalEnv = this.env[0];
    globalNode.data.items.forEach((varname: ASTNode) => {
        const globalVslot: number = globalEnv.st._var.get(varname);     // get the address in Heap
        let vslotAddr: number;
        if (globalVslot === undefined) {
            // if this global variable does not exist, create a new one in the heap
            const newVslotAddr = this.heap.ptr++;
            const newVstoreAddr = this.heap.ptr++;
            const newVslot: IVSlot = {
                modifiers: [true, false, false, false, false, false, false, false],
                name: varname,
                vstoreAddr: newVstoreAddr,
            };
            const newVstore: IVStore = {
                hstoreAddr: undefined,
                refcount: 1,
                type: null,
                val: null,
            };
            this.heap.ram.set(newVslotAddr, newVslot);
            this.heap.ram.set(newVstoreAddr, newVstore);
            globalEnv.st._var.set(varname, newVslotAddr);
            vslotAddr = newVslotAddr;
        } else {
            vslotAddr = globalVslot;
        }

        // set the local variable's address to global variable's address
        // what happens to the previous local variable if it exists ???
        varEnv.st._var.set(varname, vslotAddr);
    });
    // Finally we do nothing on execution stack because this keyword only modify environment.
};
