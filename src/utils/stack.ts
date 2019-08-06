/**
 * @authors https://github.com/eou/php-interpreter
 * @description This file is for definition of stack data structure.
 */

export class Stack<T> {
    public container: T[] = [];
    public size(): number {
        return this.container.length;
    }
    public push(val: T) {
        this.container.push(val);
    }
    public pop(): T | undefined {
        return this.container.pop();
    }
    public top(): T | undefined {
        return this.container[this.size()];
    }
}
