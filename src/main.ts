/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The main entry for interpreting PHP.
 */
import { Interpreter } from "./interpreter/interpreter";

const php =
`<?php $a = "World";
?><div>Hello<?php echo $a; ?></div>
`;
const interpreter = new Interpreter(php);
interpreter.run();
