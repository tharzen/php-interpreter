/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";

const php =
`
<?php $a = 1;?>
<div>Hello</div>
<?php

 echo $a;

 ?>
`;
const interpreter = new Interpreter(php);
interpreter.run();

interpreter.display("ast");
interpreter.display("environment");
interpreter.display("heap");
interpreter.display("stack");
interpreter.display("result");
interpreter.display("log");
