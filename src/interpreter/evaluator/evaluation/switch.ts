/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for switch statement
 * @see
 * https://github.com/php/php-langspec/blob/197a397cf84bdcd3f896aebf15a73b5fd45a174d/spec/11-statements.md#grammar-switch-statement
 * https://www.php.net/manual/en/control-structures.switch.php
 * https://github.com/php/php-langspec/blob/63375439ff7e8a1be93d0ef7d3c3b4833d5e35a0/tests/statements/selection/switch.phpt
 */

import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";

/**
 * @example
 * switch-statement:
 *      switch   (   expression   )   {   case-statementsopt   }
 *      switch   (   expression   )   :   case-statementsopt   endswitch;
 *
 * case-statements:
 *      case-statement   case-statementsopt
 *      default-statement   case-statementsopt
 *
 * case-statement:
 *      case   expression   case-default-label-terminator   statement-listopt
 *
 * default-statement:
 *      default   case-default-label-terminator   statement-listopt
 *
 * case-default-label-terminator:
 *      ;
 *      ;
 */
export const evaluateSwitch = function(this: Evaluator) {
    const switchNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "switch");

    // transform switch node into if node
    // notice that if there is no break statement in a case node, it will execute all case bodies util end or a break statement
    const testNode = switchNode.data.test;
    const cases = switchNode.data.block.children;
    for (let i = cases.length - 1; i >= 0; i++) {
        // add all cases bodies after it util a break statement or end of switch
        // maybe poor performance
        const blockChildren: ASTNode[] = [];
        loop:
        for (let j = i; j < cases.length; j++) {
            for (const expr of cases[j].children) {
                if (expr.kind === "break") {
                    break loop;
                } else {
                    blockChildren.push(expr);
                }
            }
        }
        let newIfNode: ASTNode = null;
        if (cases[i].test === null) {
            // default node
            newIfNode = {
                alternate: null,
                body: {
                    children: blockChildren,
                    kind: "block",
                },
                kind: "if",
                test: {
                    kind: "boolean",
                    raw: "true",
                    value: true,
                },
            };
        } else {
            const newTestNode: ASTNode = {
                kind: "bin",
                left: testNode,
                right: cases[i].test,
                type: "==",
            };
            newIfNode = {
                alternate: null,
                body: {
                    children: blockChildren,
                    kind: "block",
                },
                kind: "if",
                test: newTestNode,
            };
        }
        this.stk.push({
            data: null,
            inst: "endSwitch",
            kind: StkNodeKind.indicator,
        });
        this.stk.push({
            data: newIfNode,
            inst: null,
            kind: StkNodeKind.ast,
        });
    }
};
