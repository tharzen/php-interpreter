/**
 * @authors
 * https://github.com/tharzen/php-interpreter
 * @description
 * The definition of evaluator's environment
 */

// ██████████████████████████████████████████████████████████████████████████████████████████████████████████
// ██████████████████████████████████████████████ ENVIRONMENT ███████████████████████████████████████████████
// ██████████████████████████████████████████████████████████████████████████████████████████████████████████

/**
 * @description
 * Environment of the evaluator.
 * (SICP) Each environment frame is a table (possibly empty) of bindings, which associate variable names with their corresponding values.
 * (SICP) Each environment frame also has a pointer to its enclosing environment.
 * Without any namespace definition, all classes and functions definition are placed into the global space
 * @property {string} name - environment name
 * @property {ISymbolTable} st - symbol table
 */
export class Env {
    public name: string;
    public st: ISymbolTable;
    constructor(name: string) {
        this.name = name;
        this.st = {
            _class: new Map(),
            _constant: new Map(),
            _function: new Map(),
            _interface: new Map(),
            _namespace: new Map(),
            _trait: new Map(),
            _var: new Map(),
        };
    }
}

/**
 * @description
 * A symbol table is an abstract data type (ADT) for tracking various symbols in source code.
 * These symbols' addresses are stored in Heap of evaluator.
 * @property {Map} _var -       variable name => vslot address
 * @property {Map} _constant -  constant name => address
 * @property {Map} _class -     class name => address
 * @property {Map} _function -  function name => address
 * @property {Map} _trait -     trait name => address
 * @property {Map} _interface - interface name => address
 * @property {Map} _namespace - namespace name => address
 */
export interface ISymbolTable {
    _var: Map<string, number>;
    _constant: Map<string, number>;
    _class: Map<string, number>;
    _function: Map<string, number>;
    _trait: Map<string, number>;
    _interface: Map<string, number>;
    _namespace: Map<string, number>;
}

/**
 * When the program starts, evaluater will init global environment first.
 * When encounter with:
 *      - variable, vslot, vstore, hstore are all stored in Heap and the vslot addresses are stored in symbol table's `_var`
 *      - class (declaration), evaluator will evaluate it as a IClass model and then store it in the Heap,
 *        its address will be stored in symbol table's `_class`.
 *          - properties will be stored in Heap and its address will be stored in the `IClass.property` which is also a symbol table
 *          - methods will be stored in Heap and its address will be stored in the `IClass.method` which is also a symbol table
 *      - function (declaration), evaluator will evaluate it as a IFunction model and then store it in the Heap,
 *        its address will be stored in symbol table's `_function`.
 *      - trait, same as class
 *      - namespace, save the AST node in the Heap
 *        and then continue evaluating in that environment
 *      - call function or a closure, the evaluator will create a new environment immediately,
 *                                    and pass the arguments or `use` parent environment's variables in it
 *      - new a object, create a new object and stored in Heap, and its property wil be stored in `IObject.property` which is also a symbol table
 */
