export class Stack<T> {
    _container: T[] = [];
    size(): number {
        return this._container.length;
    }
    push(val: T) {
        this._container.push(val);
    }
    pop(): T | undefined {
        return this._container.pop();
    }
    top(): T | undefined {
        return this._container[this.size()];
    }
}