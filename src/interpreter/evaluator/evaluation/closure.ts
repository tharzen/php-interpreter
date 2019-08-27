/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for anonymous functions, also known as closures, evaluation
 * @see
 * https://www.php.net/manual/en/functions.anonymous.php
 * https://github.com/php/php-langspec/blob/master/spec/13-functions.md#anonymous-functions
 * https://github.com/php/php-langspec/blob/master/spec/10-expressions.md#anonymous-function-creation
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { evalStkPop, Evaluator, IStkNode, StkNodeKind } from "../evaluator";
import { IClosure, IParameter } from "../memory";

/**
 * @example
 * anonymous-function-creation-expression:
 *      static_opt   function   &_opt   (   parameter-declaration-listopt   )   anonymous-function-use-clauseopt   return-typeopt   compound-statement
 * anonymous-function-use-clause:
 *      use   (   use-variable-name-list   )
 * use-variable-name-list:
 *      &_opt   variable-name
 *      use-variable-name-list   ,   &_opt   variable-name
 * $callback1 = static function ($c) use (&$count)
 * {
 *      ++$count;
 * };
 * $a = function($f) use($f) {
 *      return $f;
 * };
 * $a(3); // will return Fatal error:  Cannot use lexical variable $f as a parameter name because they are duplicate
 */
Evaluator.prototype.evaluateClosure = function() {
    const closureNode: ASTNode = evalStkPop(this.stk, StkNodeKind.ast, "closure");

    // evaluate closures to IClosure abstract model, a temporary object
    const closureObj: IClosure = {
        _static: false,
        args: [],
        body: null,
        byref: false,
        name: "",
        st: new Map(),
        type: "",
        use: [],
    };

    closureObj.type = closureNode.kind;
    closureObj._static = closureNode.isStatic;
    closureObj.name = closureNode.name.name;
    closureNode.arguments.forEach((parameterNode: ASTNode) => {
        // parameters can be passed by reference
        // https://www.php.net/manual/en/language.references.pass.php
        const parameter: IParameter = {
            byref: parameterNode.byref,
            name: parameterNode.name,
            nullable: parameterNode.nullable,
            type: parameterNode.type,
            value: parameterNode.value,
            variadic: parameterNode.variadic,
        };
        closureObj.args.push(parameter);
    });
    closureNode.uses.forEach((useNode: ASTNode) => {
        closureObj.use.push(useNode);
    });
    closureObj.body = closureNode.body;   // could be a block Node
    closureObj.byref = closureNode.byref; // if return a reference or not

    // need to push the result to the stack for possible next evaluation
    const stknode: IStkNode = {
        data: closureObj,
        inst: null,
        kind: StkNodeKind.value,
    };
    this.stk.push(stknode);
};
