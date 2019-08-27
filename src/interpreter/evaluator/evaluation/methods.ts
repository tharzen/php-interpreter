/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for function members, called methods evaluation.
 * @see
 * https://github.com/php/php-langspec/blob/master/spec/14-classes.md#methods
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { evalStkPop, Evaluator, IStkNode, StkNodeKind } from "../evaluator";
import { IMethod, IParameter } from "../memory";

/**
 * @example
 * method-declaration:
 *      method-modifiersopt   function-definition
 *      method-modifiers   function-definition-header   ;
 * method-modifiers:
 *      method-modifier
 *      method-modifiers   method-modifier
 * method-modifier:
 *      visibility-modifier
 *      static-modifier
 *      class-modifier
 */
Evaluator.prototype.evaluateFunction = function() {
    const methodNode: ASTNode = evalStkPop(this.stk, StkNodeKind.ast, "method");

    // evaluate functions to IFunction abstract model, a temporary object
    const methodObj: IMethod = {
        _class: "",
        args: [],
        body: null,
        byref: false,
        //         global,static,const,public,protected,private,final,abstract
        modifiers: [false, false, false, false, false, false, false, false],
        name: "",
        st: new Map(),
        type: "",
    };

    methodObj.type = methodNode.kind;
    methodObj.name = methodNode.name.name;
    methodNode.arguments.forEach((parameterNode: ASTNode) => {
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
        methodObj.args.push(parameter);
    });
    methodObj.body = methodNode.body;   // could be a block Node
    methodObj.byref = methodNode.byref; // if return a reference or not
    methodObj.modifiers[1] = methodNode.isStatic;
    methodObj.modifiers[6] = methodNode.isFinal;
    methodObj.modifiers[7] = methodNode.isAbstract;
    /**
     * Class methods may be defined as public, private, or protected.
     * Methods declared without any explicit visibility keyword are defined as public.
     */
    switch (methodNode.visibility) {
        case "":
        case "public":
            methodObj.modifiers[3] = true;
            break;
        case "protected":
            methodObj.modifiers[4] = true;
            break;
        case "private":
            methodObj.modifiers[5] = true;
            break;
        default:
            throw new Error("Eval Error: Unidentified method visibility: " + methodNode.visibility);
    }

    // need to push the result to the stack for possible next evaluation
    const stknode: IStkNode = {
        data: methodObj,
        inst: null,
        kind: StkNodeKind.value,
    };
    this.stk.push(stknode);
};
