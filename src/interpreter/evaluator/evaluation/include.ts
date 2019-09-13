/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The file for 'include' keyword evaluation
 * @see
 * https://www.php.net/manual/en/function.include.php
 * https://www.php.net/manual/en/function.require.php
 * https://www.php.net/manual/en/function.include-once.php
 * https://www.php.net/manual/en/function.require-once.php
 */

// import * as fs from "fs";
// import { Node as ASTNode } from "../../php-parser/src/ast/node";
import { Evaluator, IStkNode, StkNodeKind, stkPop } from "../evaluator";

/**
 * @example
 * include "/foo.txt";
 * include ("/foo.txt");
 *
 * ❗️ATTENTION: This should be implemented by outer file system
 */
export const evaluateInclude = function(this: Evaluator) {
//     const includeNode: ASTNode = stkPop(this.stk, StkNodeKind.ast, "include");

//     // read PHP in target file and then pares it into a AST, insert this AST into current AST
//     const path = includeNode.data.target.value;
//     if (!fs.existsSync(path)) {
//         this.log += ("Warning: include(" + path + "): failed to open stream: No such file or directory");
//         this.log += ("Warning: include(): Failed opening '" + path + "' for inclusion (include_path='.:')");
//         return;
//     }

//     const src = fs.readFileSync(path, "utf8");
//     const newAST: ASTNode = this.psr.parseCode(src);
//     for (let i = newAST.children.length - 1; i >= 0; i++) {
//         this.stk.push(newAST.children[i]);
//     }
};
