/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";

const php =
`<?php
$a = "123";
$a[10] = "a";
$d = $a[];
?>`;
const interpreter = new Interpreter(php);
interpreter.run();
