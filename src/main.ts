/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";

const php =
`<?php
    $a = "!23";
    $a[6] = [3,4];
?>`;
const interpreter = new Interpreter(php);
interpreter.run();
