/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for class declaration evaluation.
 * @see
 * https://www.php.net/manual/en/language.oop5.basic.php#language.oop5.basic.class
 * https://github.com/php/php-langspec/blob/master/spec/14-classes.md
 * https://wiki.php.net/rfc/anonymous_classes
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";
import { IClass } from "../memory";

/**
 * class-declaration:
 *      class-modifieropt   class   name   class-base-clauseopt   class-interface-clauseopt   {   class-member-declarationsopt   }
 * class-modifier:
 *      abstract
 *      final
 * class-base-clause:
 *      extends   qualified-name
 * class-interface-clause:
 *      implements   qualified-name
 *      class-interface-clause   ,   qualified-name
 * 
 * class-member-declarations:
 *      class-member-declaration
 *      class-member-declarations   class-member-declaration
 * class-member-declaration:
 *      class-const-declaration
 *      property-declaration
 *      method-declaration
 *      constructor-declaration
 *      destructor-declaration
 *      trait-use-clause
 */
export const evaluateClass = function(this: Evaluator) {
    const classNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "class");

    // evaluate functions to IFunction abstract model, a temporary object
    const classObj: IClass = {
        _constant: new Map(),
        _extend: "",
        _method: new Map(),
        _property: new Map(),
        //         global,static,const,public,protected,private,final,abstract
        modifiers: [false, false, false, false, false, false, false, false],
        name: "",
        type: "",
    };

    classObj.type = classNode.data.kind;         // class
    classObj.name = classNode.data.name.name;    // class name
    classObj._extend = classNode.data.extends.name;
    classNode.data.body.forEach((bodyNode: ASTNode) => {
        this.stk.push(bodyNode);
        this.evaluate();
        const bodyObj = this.stk.top; this.stk.pop();
        switch (bodyObj.value.data.kind) {
            case "const": {
                
                break;
            }
            case "property": {

                break;
            }
            case "method": {

                break;
            }
            default:
                break;
        }
    });

    // need to push the result to the stack for possible next evaluation
    const stknode: IStkNode = {
        data: classObj,
        inst: null,
        kind: StkNodeKind.value,
    };
    this.stk.push(stknode);
};
