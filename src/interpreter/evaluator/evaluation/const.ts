/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The file for constants evaluation
 * @see
 * https://www.php.net/manual/en/language.oop5.constants.php
 * https://www.php.net/manual/en/language.constants.php
 * https://github.com/php/php-langspec/blob/master/spec/06-constants.md
 * https://github.com/php/php-langspec/blob/master/spec/14-classes.md#constants
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";
import { createVariable, ILocation, IVStore, setValue } from "../memory";

/**
 * The constants can only hold a value of a scalar type, an array or a resource.
 * A constant is a named value. Once defined, the value of the constant can not be changed.
 *
 * const-declaration:
 *      const   const-elements   ;
 * class-const-declaration:
 *      visibility-modifier_opt   const   const-elements   ;
 * const-elements:
 *      const-element
 *      const-elements   ,   const-element
 * const-element:
 *      name   =   constant-expression
 */
export const evaluateConstant = function(this: Evaluator) {
    const constNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "constant");

    // create a const variable in heap and then push the address into stack
    // some const variables are class const, it should not be stored in any environments' symbol table
    const constName = constNode.data.name.name;
    const newVslotAddr = createVariable(this.heap, constName);
    this.heap.ram.get(newVslotAddr).modifiers[2] = true;        // const

    const vslotAddr = newVslotAddr;
    const vstoreAddr = this.heap.ram.get(newVslotAddr).vstoreAddr;
    const vstore: IVStore = this.heap.ram.get(vstoreAddr);
    const hstoreAddr = vstore.hstoreAddr;

    // get the value of this const
    if (constNode.data.value === null) {
        vstore.type = null;
        vstore.val = null;
    } else {
        const valNode: IStkNode = {
            data: constNode.data.value,
            inst: "getValue",
            kind: StkNodeKind.ast,
        };
        this.stk.push(valNode);
        this.evaluate();
        const resNode: ASTNode = stkPop(this.stk, StkNodeKind.value);
        // TODO accept all scalar type and array here (not consider 'resource' right now)
        if (typeof resNode.data === "object" && resNode.data.type !== "array") {
            throw new Error("Fatal error: Constant expression contains invalid operations.\n");
        }
        setValue(this.heap, vslotAddr, resNode.data);
    }

    // get its memory location
    const stknode: IStkNode = {
        data: null,
        inst: null,
        kind: null,
    };
    const address: ILocation = {
        hstoreAddr,
        type: "const",
        vslotAddr,
        vstoreAddr,
    };
    stknode.data = address;
    stknode.kind = StkNodeKind.address;

    // need to push the result to the stack for possible next evaluation
    this.stk.push(stknode);
};
