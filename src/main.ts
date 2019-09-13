/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry for interpreting PHP.
 */
import util = require("util");
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
console.log(util.inspect(interpreter, { depth: null }));       // test
