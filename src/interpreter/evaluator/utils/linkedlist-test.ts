/**
 * @author
 * https://github.com/tharzen/php-interpreter
 * @description
 * Test file for linkedlist data structure.
 */
import util = require("util");
import { LinkedList } from "./linkedlist";

const linkedlist = new LinkedList();

for (let i = 0; i < 10; i++) {
    const num = Math.floor(Math.random() * Math.floor(10));
    if (num > 3) {
        // add
        console.log("LinkedList: ");
        console.log(util.inspect(linkedlist, { depth: null }));
        console.log("----------------------------------------");
        console.log("Add " + num);
        linkedlist.add(num);
        console.log(util.inspect(linkedlist, { depth: null }));
        console.log("----------------------------------------");
        console.log("----------------------------------------");
    } else {
        // remove
        console.log("LinkedList: ");
        console.log(util.inspect(linkedlist, { depth: null }));
        console.log("----------------------------------------");
        console.log("Remove");
        linkedlist.remove();
        console.log(util.inspect(linkedlist, { depth: null }));
        console.log("----------------------------------------");
        console.log("----------------------------------------");
    }
}
