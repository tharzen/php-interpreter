/**
 * This file is the main entry of interpreter.
 */

import { Stack } from '../utils/stack';
import { AST } from '../php-parser/src/ast';
import { Node } from '../php-parser/src/ast/node';

/**
 * @param {object}  ast - abstract syntax tree
 * @param {object}  env - execution environment
 * @param {object}  ini - options from php.ini file
 * @param {Stack}   stk - stack stores all expressions (AST nodes)
 * @param {Node}    exp - current execute expressions (AST node)
 */
class Interpreter {
    ast: AST;
    env: object;
    ini: object;
    stk: Stack<Node>;
    exp: Node;

}

export { Interpreter };