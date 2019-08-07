import util = require("util");
import { Stack } from "./stack";

const stack = new Stack();

for (let i = 0; i < 10; i++) {
    const num = Math.floor(Math.random() * Math.floor(10));
    if (num > 3) {
        // push
        console.log("Stack: ");
        console.log(util.inspect(stack, { depth: null }));
        console.log("----------------------------------------");
        console.log("Push " + num);
        stack.push(num);
        console.log(util.inspect(stack, { depth: null }));
        stack.top.value === num ? console.log("Push correctly") : console.log("Something wrong")
        console.log("----------------------------------------");
        console.log("----------------------------------------");
    } else {
        // pop
        console.log("Stack: ");
        console.log(util.inspect(stack, { depth: null }));
        console.log("----------------------------------------");
        console.log("Pop");
        stack.pop();
        console.log(util.inspect(stack, { depth: null }));
        console.log("----------------------------------------");
        console.log("----------------------------------------");
    }
}
