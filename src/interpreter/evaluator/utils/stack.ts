/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The Stack class represents a last-in-first-out (LIFO) stack of objects.
 * It is a recursion version implemented with linkedlist.
 */

import { INode, LinkedList } from "./linkedlist";

export class Stack<T> extends LinkedList<T> {
    public top: INode<T> = null;

    /**
     * @description
     * Returns the number of elements in this list
     */
    public length = () => this.length();

    /**
     * @description
     * Pushes the specified element to the stack
     */
    public push(val: T) {
        this.add(val);
        this.top = this.peekLast();
    }

    /**
     * @description
     * Pops the top element from the stack
     */
    public pop(): boolean {
        if (this.remove()) {
            this.top = this.peekLast();
            return true;
        } else {
            this.top = null;
            return false;
        }
    }
}
