/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";

const php =
`<?php
const a = 1;
?>`;
const interpreter = new Interpreter(php);
interpreter.run();
