/**
 * @author
 * https://github.com/tharzen/php-interpreter
 * @description
 * Test file for stack data structure.
 */
import util = require("util");
import { Stack } from "./stack";

var stack = Stack.empty;

for (let i = 0; i < 5; i++) {
    const num = Math.floor(Math.random() * Math.floor(10));
    if (num > 3) {
        // push
        console.log("stack empty: " + Stack.isEmpty(stack));
        console.log("Stack: ");
        console.log(util.inspect(stack, { depth: null }));
        console.log("----------------------------------------");
        console.log("Push " + num);
        stack = Stack.add(stack, num);
        console.log(util.inspect(stack, { depth: null }));
        stack.head === num ? console.log("Push correctly") : console.log("Something wrong");
        console.log("stack empty: " + Stack.isEmpty(stack));
        console.log("----------------------------------------");
        console.log("----------------------------------------");
    } else {
        // pop
        console.log("stack empty: " + Stack.isEmpty(stack));
        console.log("Stack: ");
        console.log(util.inspect(stack, { depth: null }));
        console.log("----------------------------------------");
        console.log("Pop");
        stack = Stack.pop(stack);
        console.log(util.inspect(stack, { depth: null }));
        console.log("stack empty: " + Stack.isEmpty(stack));
        console.log("----------------------------------------");
        console.log("----------------------------------------");
    }
}
