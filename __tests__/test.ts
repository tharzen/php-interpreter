/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The test file for interpreter
 */
import { Interpreter } from "../src/interpreter/interpreter";

test('test <?php $a = 1; ?>', () => {
    const interpreter = new Interpreter(`<?php $a = 1; ?>`);
    interpreter.run();

    // save the variable into global variable's symbol table
    const desiredST = new Map();
    desiredST.set("a", 0);
    expect(interpreter.evl.env[0].st._var).toMatchObject(desiredST);

    // 
});
