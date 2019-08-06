/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is the main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";
import engine from "./interpreter/php-parser/src/index.js";

const parser = new engine({
    ast: {
        withPositions: true,
    },
    parser: {
        locations: true,
    },
});

// Retrieve the AST from the specified source
// var eval = parser.parseEval('echo "My first PHP script!";');
const ast = parser.parseCode("<?php $a = 1 ?>");
const interpreter = new Interpreter(ast);
interpreter.run();
