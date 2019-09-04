/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The file for class property evaluation
 * @see
 * 
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";
import { createVariable, getValue, ILocation, IVSlot, IVStore } from "../memory";

/**
 */
export const evaluateProperty = function (this: Evaluator) {
    
};
