/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The test file for interpreter, using Jest
 */
import { Interpreter } from "../src/interpreter/interpreter";

test("$a = 1;", () => {
    const interpreter = new Interpreter(`<?php $a = 1; ?>`);
    interpreter.run();

    const evaluator = interpreter.evl;

    // test symbol table
    expect(evaluator.env[0].st._var.has("a")).toEqual(true);
    const vslotAddress = evaluator.env[0].st._var.get("a");

    // test memory
    expect(evaluator.heap.ptr).toEqual(2);  // 2 objects in heap
    expect(evaluator.heap.ram.has(vslotAddress)).toEqual(true);
    expect(evaluator.heap.ram.get(vslotAddress).modifiers[0]).toEqual(true);    // global
    expect(evaluator.heap.ram.get(vslotAddress)).toHaveProperty("name", "a");
    expect(evaluator.heap.ram.get(vslotAddress)).toHaveProperty("vstoreAddr", 1);

    const vstoreAddress = evaluator.heap.ram.get(vslotAddress).vstoreAddr;
    expect(evaluator.heap.ram.has(vstoreAddress)).toEqual(true);
    expect(vstoreAddress).toEqual(1);
    expect(evaluator.heap.ram.get(vstoreAddress)).toHaveProperty("type", "number");
    expect(evaluator.heap.ram.get(vstoreAddress)).toHaveProperty("val", 1);
    expect(evaluator.heap.ram.get(vstoreAddress)).toHaveProperty("refcount", 1);
    expect(evaluator.heap.ram.get(vstoreAddress).hstoreAddr).toBeUndefined();
});

test("$b = true;", () => {
    const interpreter = new Interpreter(`<?php $b = true; ?>`);
    interpreter.run();

    const evaluator = interpreter.evl;

    // test symbol table
    expect(evaluator.env[0].st._var.has("b")).toEqual(true);
    const vslotAddress = evaluator.env[0].st._var.get("b");

    // test memory
    expect(evaluator.heap.ptr).toEqual(2);  // 2 objects in heap
    expect(evaluator.heap.ram.has(vslotAddress)).toEqual(true);
    expect(evaluator.heap.ram.get(vslotAddress).modifiers[0]).toEqual(true);    // global
    expect(evaluator.heap.ram.get(vslotAddress)).toHaveProperty("name", "b");
    expect(evaluator.heap.ram.get(vslotAddress)).toHaveProperty("vstoreAddr", 1);

    const vstoreAddress = evaluator.heap.ram.get(vslotAddress).vstoreAddr;
    expect(evaluator.heap.ram.has(vstoreAddress)).toEqual(true);
    expect(vstoreAddress).toEqual(1);
    expect(evaluator.heap.ram.get(vstoreAddress)).toHaveProperty("type", "boolean");
    expect(evaluator.heap.ram.get(vstoreAddress)).toHaveProperty("val", true);
    expect(evaluator.heap.ram.get(vstoreAddress)).toHaveProperty("refcount", 1);
    expect(evaluator.heap.ram.get(vstoreAddress).hstoreAddr).toBeUndefined();
});
