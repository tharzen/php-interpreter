/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is the main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";

const php = `
<?php
    $a = 1;
?>`;
const interpreter = new Interpreter(php);
interpreter.run();
