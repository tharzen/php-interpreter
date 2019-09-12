/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The Stack class represents a last-in-first-out (LIFO) stack of objects.
 * It is a recursion version implemented with linkedlist.
 */
 
export type EmptyStack = null;
export type StackType<T> = NonEmptyStack<T> | EmptyStack;

export interface NonEmptyStack<T> {
    head: T,
    tail: StackType<T>
}

export var Stack = {
  empty : null,

  add : <T>(stack: StackType<T>, val: T) => {
    return { head: val, tail: stack };
  },
  isEmpty : <T>(stack: StackType<T>) => {
    return stack == null;
  },
  remove : <T>(stack: StackType<T>) => {
    return [stack.head, stack.tail];
  },
  pop : <T>(stack: StackType<T>) => {
    return stack.tail;
  }
};