import { timingSafeEqual } from "crypto";

/**
 * @authors https://github.com/eou/php-interpreter
 * @description
 * Single-linked list implementation.
 */
export class LinkedList<T> {
    private head: INode<T> = null;
    private tail: INode<T> = null;
    private size: number = 0;

    /**
     * @description
     * Returns true if this list contains no elements
     */
    public isEmpty = () => !this.head;

    /**
     * @description
     * Returns the number of elements in this list
     */
    public length = () => this.size;

    /**
     * @description
     * Returns the last element in this list
     */
    public peekLast = () => this.tail;

    /**
     * @description
     * Appends the specified element to the end of this list
     */
    public add = (value: T): LinkedList<T> => {
        const node = this.newNode(value);
        if (this.isEmpty()) {
            this.head = node;
            this.tail = this.head;
            this.size = 1;
            return this;
        }
        this.appendToTheEndOfTheList(node);
        this.size += 1;
        return this;
    }

    /**
     * @description
     * Removes the last element in this list
     */
    public remove = (): boolean => {
        // empty list
        if (this.isEmpty()) {
            return false;
        }

        // list with only one element
        if (this.head.next == null) {
            this.head = null;
            this.tail = this.head;
            this.size = 0;
            return true;
        }

        let sndlast = this.head;
        while (sndlast.next !== this.tail) {
            sndlast = sndlast.next;
        }
        this.tail = sndlast;
        this.tail.next = null;
        this.size -= 1;
        return true;
    }

    private newNode = (value: T): INode<T> => {
        return { value, next: null };
    }

    private appendToTheEndOfTheList = (node: INode<T>) => {
        this.tail.next = node;
        this.tail = node;
    }
}

export interface INode<T> {
    value: T;
    next?: INode<T>;
}
