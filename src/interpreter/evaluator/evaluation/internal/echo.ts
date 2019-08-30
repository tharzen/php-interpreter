/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for `echo` evaluation.
 * echo ( string $arg1 [, string $... ] ) : void
 * @see
 * https://www.php.net/manual/en/function.echo.php
 */

import { Node as ASTNode } from "../../../php-parser/src/ast/node";
import { Evaluator, StkNodeKind, stkPop } from "../../evaluator";

/**
 * In PHP ‘echo’ statement is a language construct and never behaves like a function, hence no paranthesis required.
 * The end of echo statement is identified by the semi-colon (‘;’).
 * echo 'This ' , 'string ' , 'was ' . 'made ' . 'with concatenation.' . "\n";
 * <?="123" ?> // shortform of echo
 */
export const evaluateEcho = function(this: Evaluator) {
    // right now we don't consider echo shortform
    const echoNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "echo");
    // evaluate expressions and convert them into string into result
    echoNode.data.expressions.forEach((exprNode: ASTNode) => {
        this.stk.push({
            data: exprNode,
            inst: "getValue",
            kind: StkNodeKind.ast,
        });
        this.evaluate();

        // convert the result into string or throw recoverable error
        const resultNode: ASTNode = stkPop(this.stk, StkNodeKind.value);
        switch (typeof resultNode.data) {
            case "boolean": {
                if (resultNode.data === true) {
                    this.res += "1";
                }
                // false => null, output nothing
                break;
            }
            case "number": {
                this.res += resultNode.data.toString();
                break;
            }
            case "string": {
                this.res += resultNode.data;
                break;
            }
            case "object": {
                if (resultNode.data.type === "array") {
                    this.log += ("Notice:  Array to string conversion\n");
                    this.res += "Array";
                } else if (resultNode.data.type === "object") {
                    throw new Error("Recoverable fatal error: Object of class a could not be converted to string");
                } else {
                    throw new Error("Eval error: unidentified echo type");
                }
                break;
            }
            default: {
                throw new Error("Eval error: unidentified echo type");
            }
        }
    });
};
