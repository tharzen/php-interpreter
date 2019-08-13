/**
 * @authors
 * https://github.com/eou/php-interpreter
 * @description
 * The main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";

const php = `<?php $a = 1; $a = $d = true; ?>`;
const interpreter = new Interpreter(php);
interpreter.run();
